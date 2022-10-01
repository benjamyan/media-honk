import React from 'react';
import ReactDOM from 'react-dom';

interface CastModelProps {
    isOpen: boolean;
}

export const CastOptionsModal = (props: CastModelProps) => {
    // const [ modalActive, setModalActive ] = React.useState<boolean>(!!props.isOpen);

    // React.useEffect(()=> {
    //     if (modalActive) {
    //         ReactDOM.render(
    //             <React.Fragment>
    //                 <aside className='cast__modal'>
    //                     cast
    //                 </aside>
    //                 <div className='cast__modal--bg' onClick={()=>setModalActive(false)} />
    //             </React.Fragment>,
    //             document.getElementById('plugin') as HTMLElement
    //         );
    //     } else {
    //         ReactDOM.unmountComponentAtNode(
    //             document.getElementById('plugin') as HTMLElement
    //         );
    //     }
    // }, [ modalActive ])
    ReactDOM.render(
        <React.Fragment>
            <aside className='cast__modal'>
                cast
            </aside>
            <div className='cast__modal--bg' />
        </React.Fragment>,
        document.getElementById('plugin') as HTMLElement
    );
    return <></>
}
