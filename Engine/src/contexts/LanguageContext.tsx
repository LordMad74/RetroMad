import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (path: string) => string;
}

const translations: Record<string, any> = { fr, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'fr';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const t = (path: string): string => {
        const keys = path.split('.');
        let result = translations[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to path string if not found
            }
        }

        return result as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
