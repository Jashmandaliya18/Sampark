import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore.js';
import { MessageSquare } from "lucide-react"

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore()

  const validateForm = () => { };

  const handleSubmit = (e) => {
    e.preventDefacult()
  };

  return (
    <div></div>
  )
}

export default SignUpPage
