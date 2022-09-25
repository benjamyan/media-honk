import React from 'react';
import './_Buttons.scss';

interface CloseButtonProps {
    className?: string;
    onClickFn?: ()=> void; 
}

export function CloseButton(props: CloseButtonProps) {


    return (
        <div 
            className={`button__close ${props.className}`} 
            onClick={()=> {
                if (props.onClickFn !== undefined) {
                    props.onClickFn()
                }
            }} 
        />
    )
} 
