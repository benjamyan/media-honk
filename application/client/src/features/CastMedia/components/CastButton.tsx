import React from 'react'

interface CastMediaBtnProps {
    className?: string;
    onButtonClickFn: ()=> void; 
}

export const CastMediaButton = (props: CastMediaBtnProps)=> (
    <div 
        className={`${props.className || ''} cast__button`} 
        onClick={()=>{
            if (props.onButtonClickFn !== undefined) {
                props.onButtonClickFn();
            }
            // setModalActive(true)
        }} 
    />
)