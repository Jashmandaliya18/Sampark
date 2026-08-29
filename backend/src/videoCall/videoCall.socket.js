import { VIDEO_CALL_EVENTS, CALL_STATUS } from './videoCall.constants.js';
import { getReceiverSocketId } from '../lib/socket.js';

// In-memory call management
const activeCalls = new Map(); // callId -> { callId, callerId, receiverId, caller, status }
const userCallMap = new Map(); // userId -> callId

const cleanupCall = (callId) => {
    const call = activeCalls.get(callId);
    if (!call) return null;

    userCallMap.delete(String(call.callerId));
    userCallMap.delete(String(call.receiverId));
    activeCalls.delete(callId);

    return call;
};

export const registerVideoCallHandlers = (io, socket) => {
    const currentUserId = String(socket.handshake.query.userId || '');

    // Initiate Call Request
    socket.on(VIDEO_CALL_EVENTS.REQUEST, (data) => {
        const { callId, receiverId, caller } = data || {};
        if (!callId || !receiverId) {
            return socket.emit(VIDEO_CALL_EVENTS.ERROR, { message: 'Invalid call parameters.' });
        }

        const callerId = String(currentUserId || caller?._id || '');
        const targetId = String(receiverId);

        if (!callerId) {
            return socket.emit(VIDEO_CALL_EVENTS.ERROR, { message: 'Unauthenticated caller.' });
        }

        // Check if caller is already in a call
        if (userCallMap.has(callerId)) {
            return socket.emit(VIDEO_CALL_EVENTS.ERROR, { message: 'You are already in an active call.' });
        }

        // Check if receiver is already in a call
        if (userCallMap.has(targetId)) {
            return socket.emit(VIDEO_CALL_EVENTS.BUSY, { callId, receiverId: targetId });
        }

        const receiverSockets = getReceiverSocketId(targetId);
        if (!receiverSockets || receiverSockets.length === 0) {
            return socket.emit(VIDEO_CALL_EVENTS.ERROR, { message: 'User is currently offline.' });
        }

        // Store active call
        const callSession = {
            callId,
            callerId,
            receiverId: targetId,
            caller,
            status: CALL_STATUS.RINGING,
            createdAt: Date.now(),
        };

        activeCalls.set(callId, callSession);
        userCallMap.set(callerId, callId);
        userCallMap.set(targetId, callId);

        // Forward call request to receiver
        receiverSockets.forEach((sId) => {
            io.to(sId).emit(VIDEO_CALL_EVENTS.REQUEST, {
                callId,
                caller,
                callerId,
            });
        });
    });

    // Accept Call
    socket.on(VIDEO_CALL_EVENTS.ACCEPTED, (data) => {
        const { callId, callerId } = data || {};
        const call = activeCalls.get(callId);
        if (!call) return;

        call.status = CALL_STATUS.CONNECTING;

        const callerSockets = getReceiverSocketId(String(callerId || call.callerId));
        callerSockets.forEach((sId) => {
            io.to(sId).emit(VIDEO_CALL_EVENTS.ACCEPTED, {
                callId,
                receiverId: currentUserId,
            });
        });
    });

    // Reject Call
    socket.on(VIDEO_CALL_EVENTS.REJECTED, (data) => {
        const { callId, callerId } = data || {};
        const call = cleanupCall(callId);
        const targetId = String(callerId || call?.callerId || '');

        if (targetId) {
            const callerSockets = getReceiverSocketId(targetId);
            callerSockets.forEach((sId) => {
                io.to(sId).emit(VIDEO_CALL_EVENTS.REJECTED, { callId });
            });
        }
    });

    // Cancel Call (by caller before accept)
    socket.on(VIDEO_CALL_EVENTS.CANCELLED, (data) => {
        const { callId, receiverId } = data || {};
        const call = cleanupCall(callId);
        const targetId = String(receiverId || call?.receiverId || '');

        if (targetId) {
            const receiverSockets = getReceiverSocketId(targetId);
            receiverSockets.forEach((sId) => {
                io.to(sId).emit(VIDEO_CALL_EVENTS.CANCELLED, { callId });
            });
        }
    });

    // Forward SDP Offer
    socket.on(VIDEO_CALL_EVENTS.OFFER, (data) => {
        const { callId, offer, receiverId } = data || {};
        const targetId = String(receiverId);
        const receiverSockets = getReceiverSocketId(targetId);

        receiverSockets.forEach((sId) => {
            io.to(sId).emit(VIDEO_CALL_EVENTS.OFFER, {
                callId,
                offer,
                callerId: currentUserId,
            });
        });
    });

    // Forward SDP Answer
    socket.on(VIDEO_CALL_EVENTS.ANSWER, (data) => {
        const { callId, answer, callerId } = data || {};
        const call = activeCalls.get(callId);
        if (call) {
            call.status = CALL_STATUS.CONNECTED;
        }

        const targetId = String(callerId);
        const callerSockets = getReceiverSocketId(targetId);

        callerSockets.forEach((sId) => {
            io.to(sId).emit(VIDEO_CALL_EVENTS.ANSWER, {
                callId,
                answer,
                receiverId: currentUserId,
            });
        });
    });

    // Forward ICE Candidate
    socket.on(VIDEO_CALL_EVENTS.ICE_CANDIDATE, (data) => {
        const { callId, candidate, targetId } = data || {};
        if (!targetId || !candidate) return;

        const peerSockets = getReceiverSocketId(String(targetId));
        peerSockets.forEach((sId) => {
            io.to(sId).emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
                callId,
                candidate,
                senderId: currentUserId,
            });
        });
    });

    // End Call (by either participant)
    socket.on(VIDEO_CALL_EVENTS.END, (data) => {
        const { callId, targetId } = data || {};
        const call = cleanupCall(callId);

        const peerId = String(targetId || (call ? (call.callerId === currentUserId ? call.receiverId : call.callerId) : ''));

        if (peerId) {
            const peerSockets = getReceiverSocketId(peerId);
            peerSockets.forEach((sId) => {
                io.to(sId).emit(VIDEO_CALL_EVENTS.END, { callId });
            });
        }
    });

    // Handle Disconnect Cleanup
    socket.on('disconnect', () => {
        if (!currentUserId || !userCallMap.has(currentUserId)) return;

        const callId = userCallMap.get(currentUserId);
        const call = cleanupCall(callId);

        if (call) {
            const peerId = String(call.callerId === currentUserId ? call.receiverId : call.callerId);
            const peerSockets = getReceiverSocketId(peerId);
            peerSockets.forEach((sId) => {
                io.to(sId).emit(VIDEO_CALL_EVENTS.END, { callId, reason: 'peer_disconnected' });
            });
        }
    });
};
