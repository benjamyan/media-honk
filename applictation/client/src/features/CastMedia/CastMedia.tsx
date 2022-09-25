import React from 'react';
import ReactDOM from 'react-dom';

import './_CastMedia.scss';

interface CastMediaProps {
    className?: string;
    onButtonClickFn?: ()=> void;
}

export function CastMedia(props: CastMediaProps) {
    const [ modalActive, setModalActive ] = React.useState<boolean>(false);

    React.useEffect(()=>{
        (async function(){

        })()
    }, [])

    React.useEffect(()=> {
        if (modalActive) {
            ReactDOM.render(
                <React.Fragment>
                    <aside className='cast__modal'>
                        cast
                    </aside>
                    <div className='cast__modal--bg' onClick={()=>setModalActive(false)} />
                </React.Fragment>,
                document.getElementById('plugin') as HTMLElement
            );
        } else {
            ReactDOM.unmountComponentAtNode(
                document.getElementById('plugin') as HTMLElement
            );
        }
    }, [ modalActive ])

    return (
        <React.Fragment>
            <div 
                className={`${props.className || ''} cast__button`} 
                onClick={()=>{
                    if (props.onButtonClickFn !== undefined) {
                        props.onButtonClickFn();
                    }
                    setModalActive(true)
                }} 
            />
        </React.Fragment>
    )
}
