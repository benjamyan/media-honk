import { MEDIA_LIBRARY_ATTRS } from "../config/dom-attributes";

let scrollPositionY: number = 0;
const stopElementScroll = (_e: Event)=> {
    window.scrollTo(0, scrollPositionY);
}

export const toggleMediaLibraryScrollLock = (options?: {
    //
})=> {

    const MEDIA_LIBRARY_EL = document.getElementById(MEDIA_LIBRARY_ATTRS.id);
    [ MEDIA_LIBRARY_EL ].forEach((el)=> {
        if (!el) {
            console.warn('Unable to find MediaLibrary element by ID');
            return;
        }
        if (el.hasAttribute('locked')) {
            scrollPositionY = 0;
            el.removeAttribute('locked');
            window.removeEventListener('scroll', stopElementScroll);
            window.removeEventListener('mousewheel', stopElementScroll);
        } else {
            scrollPositionY = window.scrollY; // el.getBoundingClientRect().y;
            el.setAttribute('locked', '');
            window.addEventListener('scroll', stopElementScroll, { passive: false });
            window.addEventListener('mousewheel', stopElementScroll, { passive: false });
        }
    }); 
    
    
}
