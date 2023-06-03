import React from 'react';

export const useDomTracker = ()=> {
    const pageRef = React.useRef<HTMLElement>();
    
    React.useEffect(()=>{
        pageRef.current = document.getElementById('root') as HTMLElement;
    }, [])

    return {  }
}