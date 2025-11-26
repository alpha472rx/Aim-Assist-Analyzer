"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getTutorial } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const FormSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),
});

export function TutorialPanel() {
  const [tutorialContent, setTutorialContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedTopic, setSubmittedTopic] = useState<string>("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setTutorialContent("");
    setSubmittedTopic(data.topic);
    const content = await getTutorial(data.topic);
    setTutorialContent(content);
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive AI Tutorials</CardTitle>
        <CardDescription>
          Ask about aiming techniques, ethics, or game mechanics.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you want to learn about?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'flick shooting' or 'ethics of aim assist'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Tutorial
            </Button>
          </CardFooter>
        </form>
      </Form>

      {(isLoading || tutorialContent) && (
        <CardContent>
            <CardTitle className="text-lg mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>AI Response for: "{submittedTopic}"</span>
            </CardTitle>
          <ScrollArea className="h-80 w-full rounded-md border p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            ) : (
              <div
                className="prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: tutorialContent.replace(/\n/g, '<br />') }}
              />
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
