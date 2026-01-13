import Link from "next/link";
import React from "react";

export interface CtaV1Config {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
}

export function CtaV1({ config }: { config: CtaV1Config }) {
    const {
        title = "Ready to get started?",
        description = "Join thousands of users building their websites today.",
        buttonText = "Start building now",
        buttonLink = "/signup"
    } = config || {};

    return (
        <section className="py-20 bg-blue-600 dark:bg-blue-700">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {title}
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                    {description}
                </p>
                <Link
                    href={buttonLink}
                    className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                >
                    {buttonText}
                </Link>
            </div>
        </section>
    );
}
