import React from 'react';
import { DownloadIcon } from './Icons';

interface DownloadControlsProps {
    imageUrl: string;
}

const DownloadControls: React.FC<DownloadControlsProps> = ({ imageUrl }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `character-crafter-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            className="p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
            title="Download Image"
        >
            <DownloadIcon className="w-6 h-6" />
        </button>
    );
};

export default DownloadControls;
