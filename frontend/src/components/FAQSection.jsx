import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: 'How does AIRA integrate with my existing systems?',
      answer: 'AIRA seamlessly integrates with popular CRM, scheduling, and communication platforms through our API. Our team will help you set up the integration during onboarding.'
    },
    {
      question: 'Can AIRA handle multiple languages?',
      answer: 'Yes! AIRA supports multiple languages and can automatically detect and respond in the customer\'s preferred language.'
    },
    {
      question: 'What happens if AIRA cannot answer a question?',
      answer: 'AIRA is designed to handle most queries, but if it encounters something beyond its scope, it will seamlessly transfer the call to a human team member.'
    },
    {
      question: 'How secure is the data AIRA handles?',
      answer: 'Security is our top priority. All data is encrypted end-to-end, and we comply with GDPR, HIPAA, and other relevant data protection regulations.'
    },
    {
      question: 'Can I customize AIRA\'s responses?',
      answer: 'Absolutely! You can train AIRA with your specific business information, brand voice, and custom responses to ensure it represents your company perfectly.'
    }
  ];

  return (
    <section id="faqs" className="py-24 bg-zinc-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-red-600">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800">
                <AccordionTrigger className="text-white hover:text-red-600 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;