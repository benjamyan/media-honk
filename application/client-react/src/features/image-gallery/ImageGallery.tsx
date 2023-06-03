import * as React from 'react';
import { CloseButton } from '../../components';
import { MediaLibraryEntry } from '../../types';
import "./_ImageGallery.scss"

interface ImageViewerProps {
	activeGallery: MediaLibraryEntry;
	closeGallery: () => void;
}

export const ImageGallary = (props: ImageViewerProps)=> {
    const { activeGallery } = props;

    const [isFullscreen, setFullscreen] = React.useState<boolean>(false);
    const [currentImage, setCurrentImage] = React.useState<number>(0);
    const viewerRef = React.useRef<HTMLDivElement>(null)
    const imageRef = React.useRef<HTMLDivElement>(null)
    
    return (
        <div className={`image__viewer`} ref={viewerRef}>
            <CloseButton onClickFn={ props.closeGallery } />
            <div className={`image__viewer--media`} ref={imageRef}>
                <img 
                    className={`image__viewer--media-content`}
                    loading='eager'
                    // src={`/server/image?file=${activeGallery.baseUrl}/${activeGallery.entries[currentImage]}`} 
                    onClick={(e)=>{
                        if (window.innerWidth / 2 > e.clientX) {
                            if (currentImage > 0) {
                                setCurrentImage(currentImage - 1)
                                imageRef.current?.scrollTo(0,0)
                            }
                        } else {
                            if (currentImage < activeGallery.entries.length - 1) {
                                setCurrentImage(currentImage + 1)
                                imageRef.current?.scrollTo(0,0)
                            }
                        }
                    }}
                />
                { currentImage !== activeGallery.entries.length - 1 &&
                    <img
                        loading='eager'
                        className='image__viewer--media-preload'
                        // src={`/server/image?file=${activeGallery.baseUrl}/${activeGallery.entries[currentImage + 1]}`}
                    />
                }
                
            </div>
            <button 
                className={`button__fullscreen ${isFullscreen ? 'expand' : ''}`} 
                onClick={()=>{
                    if (isFullscreen) {
                        setFullscreen(false)
                        document.exitFullscreen();
                    } else {
                        setFullscreen(true)
                        viewerRef.current?.requestFullscreen();
                    }
                    
                }}
            />
		</div>
    )
}
