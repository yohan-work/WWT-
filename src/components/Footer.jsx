import React from "react";
import { Shield, Lock, Copyright } from "lucide-react";

const Footer = ({ onTermsClick, onPrivacyClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* 왼쪽: 저작권 */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Copyright className="h-3 w-3" />
            <span>© 2025 동네 알림이. All rights reserved.</span>
          </div>

          {/* 오른쪽: 법적 링크들 */}
          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={onTermsClick}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span>이용약관</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onPrivacyClick}
              className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>개인정보처리방침</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
