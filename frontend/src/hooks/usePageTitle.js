import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        // Set a default title if none is provided
        const pageTitle = title ? `${title} | Glafo` : 'Glafo';
        document.title = pageTitle;

        return () => {
            document.title = 'Glafo';
        };
    }, [title]);
};

export default usePageTitle; 