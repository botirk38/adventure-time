import React from "react";
import { LoaderIcon } from "@/components/icons";

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center">
        <LoaderIcon className="w-8 h-8 text-primary animate-spin" />
    </div>
);
