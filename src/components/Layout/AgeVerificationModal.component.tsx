"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/UI/Logo.component";

const AGE_VERIFICATION_KEY = "age_verification_accepted";
const REMEMBER_ME_KEY = "age_verification_remember_me";

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if user has already accepted and "Remember me" was checked
    const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const accepted = localStorage.getItem(AGE_VERIFICATION_KEY) === "true";

    if (!remembered && !accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true");
    }
    localStorage.setItem(AGE_VERIFICATION_KEY, "true");
    setIsOpen(false);
  };

  const handleDecline = () => {
    setShowError(true);
    // Optionally redirect away or show error message
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="age-popup-content bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Logo className="h-8 w-auto" />
        </div>

        <div className="text-center mb-6">
          <p className="mb-4 text-lg">
            <strong>You must be at least 21 to visit this site.</strong>
          </p>

          <p className="text-sm text-gray-600">
            By entering this site, you are accepting our Terms of Service
          </p>
        </div>

        <div className="age-popup-buttons flex gap-4 mb-4">
          <button
            className="age-popup-btn decline flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
            id="declineBtn"
            onClick={handleDecline}
          >
            Decline
          </button>
          <button
            className="age-popup-btn accept flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            id="acceptBtn"
            onClick={handleAccept}
          >
            Accept
          </button>
        </div>

        <div className="age-popup-remember flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 flex-shrink-0"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer !transform-none">
            Remember me
          </label>
        </div>

        {showError && (
          <div className="age-popup-error bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
            You are not old enough to view this content
          </div>
        )}

        <div className="age-popup-disclaimer text-xs text-gray-600 border-t pt-4 mt-4">
          <strong>DISCLAIMER:</strong> All products sold by Molecule are strictly
          intended for laboratory research use only. They are not approved for
          human or animal consumption, or for any form of therapeutic or
          diagnostic use.
          <br />
          <br />
          We do not provide usage instructions, dosing guidelines, or any
          advice regarding the application of our products.
          <br />
          <br />
          This is a research supply company only.
        </div>
      </div>
    </div>
  );
}

