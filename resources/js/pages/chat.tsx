import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function Chat() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    async function ask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (trimmedQuestion === '' || isLoading) {
            return;
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            { role: 'user', content: trimmedQuestion },
        ]);

        setQuestion('');
        setIsLoading(true);

        try {
            const response = await fetch('/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    question: trimmedQuestion,
                }),
            });

            const data = await response.json();

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    content: data.answer ?? 'I could not generate an answer.',
                },
            ]);
        } catch {
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    content: 'The assistant could not be reached',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Head title="Zonda Chat" />

            <main className="flex min-h-screen bg-white text-[#242424]">
                <aside
                    className={
                        isSidebarOpen
                            ? 'flex w-72 shrink-0 flex-col border-r border-[#eeeeee] bg-[#fbfbfa] transition-all'
                            : 'flex w-16 shrink-0 flex-col items-center border-r border-[#eeeeee] bg-[#fbfbfa] transition-all'
                    }
                >
                    <div className="flex h-16 items-center gap-3 border-b border-[#eeeeee] px-4">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen((value) => !value)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dedede] bg-white text-sm font-semibold text-[#242424] shadow-sm hover:border-[#bdbdbd]"
                            aria-label="Toggle sidebar"
                            title="Toggle sidebar"
                        >
                            AI
                        </button>

                        {isSidebarOpen && (
                            <div>
                                <div className="text-sm font-semibold">
                                    Zonda AI
                                </div>
                                <div className="text-xs text-[#8c8c8c]">
                                    Document assistant
                                </div>
                            </div>
                        )}
                    </div>

                    {isSidebarOpen && (
                        <div className="flex flex-1 flex-col gap-6 p-4">
                            <button
                                type="button"
                                onClick={() => setMessages([])}
                                className="rounded-full border border-[#dddddd] bg-white px-4 py-3 text-left text-sm font-semibold text-[#242424] shadow-sm hover:border-[#bdbdbd]"
                            >
                                New chat
                            </button>

                            <section>
                                <h2 className="mb-2 text-xs font-semibold text-[#a0a0a0] uppercase">
                                    History
                                </h2>

                                <div className="rounded-2xl border border-[#eeeeee] bg-white px-4 py-3 text-sm leading-5 text-[#8c8c8c] shadow-sm">
                                    No previous chats yet.
                                </div>
                            </section>

                            <section className="mt-auto border-t border-[#eeeeee] pt-4">
                                <div className="text-xs text-[#a0a0a0] uppercase">
                                    Knowledge base
                                </div>
                                <div className="mt-1 text-sm text-[#626262]">
                                    storage/app
                                </div>
                            </section>
                        </div>
                    )}
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-16 items-center justify-between border-b border-[#eeeeee] bg-white px-8">
                        <div>
                            <h1 className="text-base font-semibold">
                                Chat with Zonda documents
                            </h1>
                            <p className="text-xs text-[#8c8c8c]">
                                Answers are generated from retrieved document
                                context.
                            </p>
                        </div>
                        <div className="rounded-full border border-[#e4e4e4] bg-[#fbfbfa] px-3 py-1 text-xs text-[#777777]">
                            RAG enabled
                        </div>
                    </header>

                    <div className="flex flex-1 justify-center overflow-hidden px-8">
                        <div className="flex w-full max-w-5xl flex-col">
                            <section className="flex-1 space-y-9 overflow-y-auto px-2 py-12">
                                {messages.length === 0 && (
                                    <div className="mx-auto mt-28 max-w-2xl text-center">
                                        <h2 className="text-4xl font-semibold tracking-normal text-[#242424]">
                                            Ask Zonda anything
                                        </h2>
                                        <p className="mt-4 text-base leading-7 text-[#8c8c8c]">
                                            This assistant searches your
                                            ingested Markdown documents before
                                            answering.
                                        </p>
                                    </div>
                                )}

                                {messages.map((message, index) => (
                                    <article
                                        key={index}
                                        className={
                                            message.role === 'user'
                                                ? 'ml-auto max-w-2xl rounded-[1.35rem] bg-[#f3f3f1] px-5 py-4 text-[#242424]'
                                                : 'mr-auto max-w-3xl px-1 py-1 text-[#242424]'
                                        }
                                    >
                                        <div
                                            className={
                                                message.role === 'user'
                                                    ? 'mb-2 text-right text-sm font-bold text-[#8a8a8a]'
                                                    : 'mb-2 text-sm font-bold text-[#8a8a8a]'
                                            }
                                        >
                                            {message.role === 'user'
                                                ? 'You'
                                                : 'Zonda Assistant'}
                                        </div>
                                        <p className="text-[1.05rem] leading-8 whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </article>
                                ))}

                                {isLoading && (
                                    <article className="mr-auto max-w-3xl px-1 py-1 text-[#242424]">
                                        <div className="mb-2 text-sm font-bold text-[#8a8a8a]">
                                            Zonda Assistant
                                        </div>
                                        <p className="text-[1.05rem] text-[#8c8c8c]">
                                            Thinking...
                                        </p>
                                    </article>
                                )}
                            </section>

                            <form
                                onSubmit={ask}
                                className="border-t border-[#eeeeee] bg-white py-6"
                            >
                                <div className="flex gap-3">
                                    <input
                                        value={question}
                                        onChange={(event) =>
                                            setQuestion(event.target.value)
                                        }
                                        disabled={isLoading}
                                        placeholder="Ask something about Zonda..."
                                        className="min-w-0 flex-1 rounded-full border border-[#dddddd] bg-white px-6 py-4 text-base text-[#242424] shadow-sm outline-none placeholder:text-[#a0a0a0] focus:border-[#bdbdbd]"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-14 rounded-full bg-[#161616] px-8 text-base font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Ask
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
