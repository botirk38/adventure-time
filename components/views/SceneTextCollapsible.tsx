import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { BookOpenIcon } from "../icons";

interface SceneTextCollapsibleProps {
    currentSceneText: string | null;
}

export const SceneTextCollapsible: React.FC<SceneTextCollapsibleProps> = ({ currentSceneText }) => {
    if (!currentSceneText) return null;

    return (
        <div className="absolute top-4 right-12 w-screen z-20">
            <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-full bg-black/80 border border-amber-400/40 backdrop-blur-md text-white hover:text-amber-300 hover:bg-amber-400/20 shadow-xl"
                    >
                        <BookOpenIcon className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-12 right-0 w-full">
                    <Card className="bg-black/80 border-amber-400/40 backdrop-blur-md shadow-xl ring-2 w-full ring-amber-400/20">
                        <CardContent className="p-4">
                            <blockquote className="border-l-4 border-amber-400/80 pl-4 text-white/90">
                                <p className="text-sm leading-relaxed italic font-medium text-shadow-sm">
                                    {currentSceneText}
                                </p>
                            </blockquote>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};
