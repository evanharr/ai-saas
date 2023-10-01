"use client";

import * as z from "zod";
import axios from "axios";
import OpenAI from "openai";

import { Code } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown"; 

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/empty";
import { Loader } from "@/components/ui/loader";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import { LoaderEmpty } from "@/components/ui/loader-empty";


const CodePage= () => {
    
    const router = useRouter();
    const proModal = useProModal();
    const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessage[]>([]);

    //form schema
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:{
            prompt:""
        }
    });

    //extract loading state
    const isLoading = form.formState.isSubmitting || false;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const userMessage: OpenAI.Chat.ChatCompletionMessage = {
                role: "user",
                content: values.prompt,
            };
            const newMessages = [...messages, userMessage ];

            const response = await axios.post("/api/code", {
                messages: newMessages,
            });

            setMessages((current) => [...current, userMessage, response.data]);

            form.reset();

        } catch(error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            router.refresh();
        }
    };

    return (
        <div>
            <Heading 
            title="Code Generation"
            description ="Generate code using descriptive text."
            icon={Code}
            iconColor="text-green-700"
            bgColor="bg-green-700/10"
            />
            <div className="px-4 lg:px-8 flex flex-col " >
                <div className="space-y-4 pl-4 pr-4 pb-4 ">

                    {messages.length=== 0 && !isLoading && (
                        <div className="border border rounded-lg">
                            <Empty label="No conversation started." />
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-y-4 ">
                        {messages.map((message) => (
                            <div 
                            key={message.content}
                            className={cn("p-8  w-full flex items-start gap-x-8 rounded-lg ",
                            message.role === "user" ? "bg-white text-foreground text-black border border-black/10" : "bg-muted")}
                            >
                                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                                
                                <ReactMarkdown 
                                components={{
                                    pre:({node, ...props}) => (
                                        <div className="overflow-auto w-full my-w bg-black/10 p-2 rounded-lg">
                                            <pre {...props} />
                                        </div>
                                    ),
                                    code: ({node, ...props}) => (
                                        <code className="bg-black/10 rounded-lg p-1" 
                                        {...props} />
                                    )
                                }}
                                className="text-sm overflow-hidden leading-7 ">
                                    {message.content || ""}
                                </ReactMarkdown>
                
                            </div>
                        ))}
                    </div>
                    {isLoading && messages.length != 0 &&(
                            <div className=" flex p-8 rounded-lg w-full items-center justify-center bg-muted">
                                <Loader />
                            </div>
                    )}

                    {isLoading && messages.length === 0 && (
                        <div className="flex ">
                            <div className="w-full">
                                <div className="flex pb-8 rounded-lg w-full items-center justify-center">
                                    <LoaderEmpty />
                                </div>
                            </div>
                        </div>
                    )} 
                </div>
            </div>

            <div className="pl-8 pr-8 pb-4 md:pl-12 md:pr-12">
                <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                        <FormField name="prompt" render={({ field }) => (
                            <FormItem className="col-span-12 lg:col-span-10">
                                <FormControl className="m-0 p-0">
                                    <Input 
                                    className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent" 
                                    disabled={isLoading} 
                                    placeholder="A Simple toggle button using react hooks." {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                            Generate
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default CodePage;