"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { logout } from "@/api";

interface LogoutButtonProps {
  onSuccess?: () => void;
  showConfirmation?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  onSuccess,
  showConfirmation = false,
  variant = "ghost",
  size = "md",
  fullWidth = false,
  children = "Sign out",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Default: redirect to login
        window.location.href = "/login";
      }
    } catch (error) {
      // Redirect to login even on error
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleClick = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      handleLogout();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading && !showConfirmation}
        onClick={handleClick}
        leftIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        }
      >
        {children}
      </Button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Sign out?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  isLoading={isLoading}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
