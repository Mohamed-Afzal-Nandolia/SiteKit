"use client";
import React, { useEffect } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = 
        type === "success" ? "bg-green-500" : 
        type === "error" ? "bg-red-500" : 
        "bg-blue-500";

    return (
        <div className={`fixed top-20 right-4 z-[200] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in text-white ${bgColor}`}>
            {message}
        </div>
    );
};
