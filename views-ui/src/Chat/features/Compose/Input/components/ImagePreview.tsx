import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ImagePreviewProps {
	imageUrl: string;
	onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onRemove }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const handleImageLoad = () => {
		setIsLoading(false);
	};

	const handleImageError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	return (
		<div
			className="p-2 relative flex items-center"
			role="figure"
			aria-label="Image preview"
		>
			{isLoading && (
				<div
					className="w-[200px] h-[150px] bg-gray-200 animate-pulse rounded-lg"
					aria-label="Loading image..."
				/>
			)}
			{hasError ? (
				<div
					className="w-[200px] h-[150px] flex items-center justify-center bg-red-100 text-red-500 rounded-lg"
					aria-label="Failed to load image"
				>
					Failed to load image
				</div>
			) : (
				<div className="pl-2 relative text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)] rounded-md p-2 flex gap-2">
					<img
						src={imageUrl}
						alt="Preview"
						crossOrigin="anonymous"
						className={`max-w-[200px] max-h-[150px] rounded-lg object-cover pointer-events-none ${
							isLoading ? "opacity-0" : "opacity-100"
						}`}
						onLoad={handleImageLoad}
						onError={handleImageError}
					/>
					<button
						onClick={onRemove}
						className="top-1 right-1 flex items-center justify-center w-6 h-6 p-0 border-none rounded-full bg-black/70 text-white cursor-pointer transition-all duration-200 ease-in-out shadow-md hover:bg-black/85 hover:shadow-lg pointer-events-auto z-10"
						aria-label="Remove image"
						title="Remove image"
						tabIndex={0}
					>
						<FaTimes size={14} />
					</button>
				</div>
			)}
		</div>
	);
};

export { ImagePreview };
