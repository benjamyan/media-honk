import { MEDIA_LIBRARY_ATTRS } from "../config/dom-attributes";

const stopElementScroll = (e: Event)=> {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
}

export const toggleMediaLibraryScrollLock = (options?: {
    //
})=> {
    const MEDIA_LIBRARY_EL = document.getElementById(MEDIA_LIBRARY_ATTRS.id);

    [ MEDIA_LIBRARY_EL, document.body ].forEach((el)=> {
        if (!el) {
            console.warn('Unable to find MediaLibrary element by ID');
            return;
        }
        if (el.hasAttribute('locked')) {
            el.removeAttribute('locked');
            el.removeEventListener('scroll', stopElementScroll);
            el.removeEventListener('mousewheel', stopElementScroll);
        } else {
            el.setAttribute('locked', '');
            el.addEventListener('scroll', stopElementScroll, { passive: false });
            el.addEventListener('mousewheel', stopElementScroll, { passive: false });
        }
    }); 
    
    
}
