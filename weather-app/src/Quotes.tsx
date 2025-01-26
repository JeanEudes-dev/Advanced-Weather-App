import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Quotes: React.FC = () => {
    const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);

    const fetchQuote = async () => {
        try {
            const response = await axios.get("https://api.breakingbadquotes.xyz/v1/quotes");
            const quoteData = response.data[0];
            console.log("Quote data:", quoteData);
            setQuote(quoteData);
        } catch (err) {
            console.error("Error fetching quote:", err);
        }
    };
    useEffect(() => {
        fetchQuote();
    }, []);
    return (
        <div className="quote-section">
            {quote ? (
                <>
                    <p className="quote-text">"{quote.quote}"</p>
                    <p className="quote-author">- {quote.author}</p>
                </>
            ) : (
                <p>Loading quote...</p>
            )}
        </div>
    )
}

export default Quotes