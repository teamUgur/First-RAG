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

    async function ask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (trimmedQuestion === '') {
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
                            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
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
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Head title="Zonda Chat" />

            <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col">
                    <header className="mb-6">
                            <h1 className="text-2xl font-semibold">Zonda Assistant</h1>
                            <p className="mt-1 text-sm text-zinc-400">
                                Ask questions using your ingested documents.
                            </p>
                    </header>

                    <section className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                        {messages.map((message, index) => (
                            <article
                                key={index}
                                className={
                                    message.role === 'user'
                                    ? 'ml-auto max-w-[85%] rounded-lg bg-sky-600 px-4 py-3'
                                    : 'mr-auto max-w-[85%] rounded-lg bg-zinc-800 px-4 py-3'
                                }
                            >
                            
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-300">
                                { message.role === 'user' ? 'You' : 'Zonda Assistant' }
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6">
                                {message.content}
                            </p>
                            </article>
                        ))}

                        {isLoading && (
                                <article className="mr-auto max-w-[85%] rounded-lg bg-zinc-800 px-4 py-3">
                                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-300">
                                        Zonda Assistant
                                    </div>
                                    <p className="text-sm text-zinc-400">Thinking...</p>
                                </article>
                            )}
                    </section>

                    <form onSubmit={ask} className="mt-4 flex gap-3">
                        <input
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            disabled={isLoading}
                            placeholder="Ask something about Zonda..."
                            className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-sky-500"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-sky-600 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Ask
                            </button>
                    </form>
                </div>
            </main>
        </>
    )
}

