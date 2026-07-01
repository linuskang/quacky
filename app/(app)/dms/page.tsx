// wip

import { ArrowUp, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import { PageCenter, PageLayout } from "@/components/page-layout";
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from "@/components/ui/card";

export default function MessagesPage() {
    return (
        <PageLayout>
            <PageCenter>
                <section className="flex min-h-0 flex-col">
                    <header className="fixed top-0 z-10 flex w-full max-w-xl items-center justify-between bg-background px-4 py-3">
                        <div className="flex gap-3">
                            <Avatar className="h-11 w-11">
                                <AvatarImage src="https://avatars.linus.my/10.x/micah/svg?seed=janedoe" />
                            </Avatar>

                            <div>
                                <h2 className="truncate text-base font-bold">Jane Doe</h2>
                                <p className="truncate text-sm text-muted-foreground">@janedoe</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                        >
                            <MoreHorizontal strokeWidth={3} />
                        </Button>
                    </header>


                    <div className="fixed top-[68px] bottom-[88px] w-full max-w-xl scrollbar-none overflow-y-auto px-4">
                        <div className="flex min-h-full flex-col justify-end space-y-4">

                            <Card className="mx-auto w-full max-w-xs">
                                <CardHeader className="justify-center">
                                    <Avatar className="mb-2 h-16 w-16">
                                        <AvatarImage src="https://avatars.linus.my/10.x/micah/svg?seed=janedoe" />
                                    </Avatar>

                                    <CardTitle>Jane Doe</CardTitle>
                                    <CardDescription className="-mt-1">@janedoe</CardDescription>
                                </CardHeader>

                                <CardContent className="-mt-2 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        This is the beginning of your conversation with Jane Doe.
                                    </p>
                                    <Button
                                        variant="default"
                                        className="rounded-full bg-primary-2 mr-2 mt-2 font-semibold"
                                    >
                                        Report
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="rounded-full mt-2 font-semibold"
                                    >
                                        Block User
                                    </Button>
                                </CardContent>
                            </Card>

                            <Message align="end">
                                <MessageContent>
                                    <Bubble variant="ghost">
                                        <BubbleContent
                                            className="!rounded-2xl !rounded-br-md !bg-primary-2 !px-3 !py-2 text-sm leading-5 !text-primary-foreground"
                                        >
                                            Hi
                                        </BubbleContent>
                                    </Bubble>
                                </MessageContent>
                            </Message>

                            <Message>
                                <MessageContent>
                                    <Bubble variant="ghost">
                                        <BubbleContent
                                            className="!rounded-2xl !rounded-bl-md !bg-card !px-3 !py-2 text-sm leading-5"
                                        >
                                            What&apos;s gooooood
                                        </BubbleContent>
                                    </Bubble>
                                </MessageContent>
                            </Message>
                            <Message>
                                <MessageContent>
                                    <Bubble variant="ghost">
                                        <BubbleContent
                                            className="!rounded-2xl !rounded-bl-md !bg-card !px-3 !py-2 text-sm leading-5"
                                        >
                                            Hru
                                        </BubbleContent>
                                    </Bubble>
                                </MessageContent>
                            </Message>

                            <Message align="end">
                                <MessageContent>
                                    <Bubble variant="ghost">
                                        <BubbleContent
                                            className="!rounded-2xl !rounded-br-md !bg-primary-2 !px-3 !py-2 text-sm leading-5 !text-primary-foreground"
                                        >
                                            ive been good
                                        </BubbleContent>
                                    </Bubble>
                                </MessageContent>
                            </Message>
                        </div>
                    </div>

                    <div className="fixed bottom-4 w-full max-w-xl bg-background px-4 pt-2 ">
                        <InputGroup className="h-auto items-end !rounded-full !ring-0 border-2 border-border p-2 focus-within:border-primary-2 dark:bg-background">
                            <InputGroupInput
                                placeholder="Message Jane Doe..."
                            />
                            <InputGroupAddon align="inline-end" className="p-0">
                                <InputGroupButton size="icon-sm" className="mr-1 rounded-full bg-primary-2 text-primary-foreground hover:!bg-primary-2/80">
                                    <ArrowUp strokeWidth={3} />
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </section>
            </PageCenter>
        </PageLayout>
    );
}
