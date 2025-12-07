"use client";

import { useState } from "react";
import SearchIcon from "@/components/UI/icons/SearchIcon.component";
import SearchModal from "@/components/Header/SearchModal.component";

const SearchTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:text-gray-900 transition-colors"
        aria-label="Search"
      >
        <span className="sr-only">Search</span>
        <SearchIcon />
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default SearchTrigger;

