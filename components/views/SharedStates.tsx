import React from "react";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../LoadingSpinner";
import { AlertIcon } from "../icons";

interface LoadingStateProps {
    message: string;
}

interface ErrorStateProps {
    error: string;
    onReset: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
    <div className="mt-8 flex flex-col items-center justify-center text-primary animate-fade-in">
        <LoadingSpinner />
        <p className="mt-3 text-lg font-semibold text-center text-brand-text">{message}</p>
    </div>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onReset }) => (
    <Alert variant="destructive" className="mt-6 animate-fade-in">
        <AlertIcon className="h-4 w-4" />
        <AlertTitle>Oh no, a hiccup!</AlertTitle>
        <AlertDescription className="mt-2">
            {error}
            <Button onClick={onReset} variant="destructive" size="sm" className="mt-3">
                Start over
            </Button>
        </AlertDescription>
    </Alert>
);
