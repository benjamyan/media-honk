import React from 'react';
import ReactDOM from 'react-dom';
// import { default as ChromecastAPI } from 'chromecast-api'

import { get_castingDevices } from '../../api';
import { CloseButton } from '../../components';
import { CastingDevice } from '../../types';
import './_CastMedia.scss';

interface CastMediaProps {
    className?: string;
    isOpen?: boolean;
    onButtonClickFn?: ()=> void;
}

const CastMediaModal = (props: CastMediaProps)=> {
    /**  */
    const [ availableDevices, setAvailableDevices ] = React.useState<CastingDevice[] | Error | false>(false);

    const DeviceSearchResult = React.useMemo(
        ()=> {
            if (!availableDevices) {
                return (
                    <p>Loading...</p>
                )
            } else if (availableDevices instanceof Error) {
                return (
                    <p>An error occured</p>
                )
            } else if (availableDevices.length === 0) {
                return (
                    <p>No devices found</p>
                )
            } else if (availableDevices.length > 0) {
                return (
                    <ul>
                        { 
                            availableDevices.map( (device)=> (
                                <li onClick={ ()=> console.log(device.friendlyName) }>{ device.friendlyName }</li>
                            )) 
                        }
                    </ul>
                )
            } else {
                return <p>Unhandled exception</p>
            }
        },
        [availableDevices]
    );

    React.useEffect(()=>{
        (async function() {
            try {
                const devices = await get_castingDevices();
                setAvailableDevices(devices)
            } catch (err) {
                console.log(err)
                setAvailableDevices(new Error('Unhandled error'))
            }
        })()
    }, [])
    
    return (
        <React.Fragment>
            <aside className='cast__modal'>
                <div className="cast__modal--header">
                    <h4>Cast to device</h4>
                    <CloseButton onClickFn={props.onButtonClickFn} />
                </div>
                <div  className='cast__modal--devices'>
                    { DeviceSearchResult }
                </div>
            </aside>
            <div className='cast__modal--bg' onClick={props.onButtonClickFn} />
        </React.Fragment>
    )
}

export function CastMedia(props: CastMediaProps) {
    // const modalActive = !!props.isOpen
    // const [ modalActive, setModalActive ] = React.useState<boolean>(props.isOpen || false);
    // const client = new ChromecastAPI()

    const pluginDomEntry = document.getElementById('plugin') as HTMLElement;
    const toggleModal = ()=> ReactDOM.unmountComponentAtNode(pluginDomEntry);

    // React.useEffect(()=>{
    //     (async function(){

    //     })()
    // }, [])

    // React.useEffect(()=> {
        // if (modalActive) {
            ReactDOM.render(
                <CastMediaModal 
                    {...props} 
                    onButtonClickFn={ ()=> {
                        if (!!props.onButtonClickFn) {
                            props.onButtonClickFn()
                        }
                        toggleModal()
                    }} 
                />,
                pluginDomEntry
            );
        // } else {
        //     ReactDOM.unmountComponentAtNode(
        //         document.getElementById('plugin') as HTMLElement
        //     );
        // }
    // }, [ modalActive ])

    // return <></>
    // return (
    //     <React.Fragment>
    //         <div 
    //             className={`${props.className || ''} cast__button`} 
    //             onClick={()=>{
    //                 if (props.onButtonClickFn !== undefined) {
    //                     props.onButtonClickFn();
    //                 }
    //                 setModalActive(true)
    //             }} 
    //         />
    //     </React.Fragment>
    // )
}
