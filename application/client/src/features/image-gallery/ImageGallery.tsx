import * as React from 'react';
import { CloseButton } from '../../components';
import "./_ImageGallery.scss"
import { useMediaPlayerContext } from '../../context';
import { stream_imageFile } from '../../api/stream_imageFile';
import { get_coverImage } from '../../api/get_coverImage';

export const ImageGallary = ()=> {
    const { selectedMedia, updateMediaPlayerContext } = useMediaPlayerContext();

    const [isFullscreen, setFullscreen] = React.useState<boolean>(false);
    const [currentImage, setCurrentImage] = React.useState<number>(0);
    const viewerRef = React.useRef<HTMLDivElement>(null);
    const imageRef = React.useRef<HTMLDivElement>(null);
    
    const closeImageGallery = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { mediaPlaying: false, currentMediaId: null, selectedMediaId: null }
    });
    
    if (!selectedMedia) return null;
    return (
        <div className={`image__viewer`} ref={viewerRef}>
            <CloseButton onClickFn={ closeImageGallery } />
            <div className={`image__viewer--media`} ref={imageRef}>
                <img 
                    className={`image__viewer--media-content`}
                    loading='eager'
                    src={
                        currentImage == 0
                            ? get_coverImage(selectedMedia._guid).static
                            : stream_imageFile(selectedMedia._guid, currentImage).static
                    }
                    onClick={(e)=>{
                        if (window.innerWidth / 2 > e.clientX) {
                            if (currentImage >= -1) {
                                setCurrentImage(currentImage - 1);
                                imageRef.current?.scrollTo(0,0);
                            }
                        } else {
                            if (currentImage <= selectedMedia.length - 1) {
                                setCurrentImage(currentImage + 1);
                                imageRef.current?.scrollTo(0,0);
                            }
                        }
                    }}
                />
                { currentImage !== selectedMedia.length - 1 &&
                    <img 
                        loading='eager' 
                        className='image__viewer--media-preload' 
                        src={stream_imageFile(selectedMedia._guid, currentImage + 1).static}    
                    />
                }
                
            </div>
            <p className={`image__viewer--count ${isFullscreen ? 'fullscreen' : ''}`} >
                {currentImage + 1}/{selectedMedia.length + 1}
            </p>
            <button 
                className={`button__fullscreen ${isFullscreen ? 'expand' : ''}`} 
                onClick={()=>{
                    if (isFullscreen) {
                        setFullscreen(false);
                        document.exitFullscreen();
                    } else {
                        setFullscreen(true);
                        viewerRef.current?.requestFullscreen();
                    }
                }}
            />
		</div>
    )
}
