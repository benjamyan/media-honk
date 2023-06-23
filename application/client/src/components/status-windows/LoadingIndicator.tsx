import React from 'react';

export const LoaderingIndicator = ()=> {

    return (
        <div style={{
            zIndex: 999, 
            background: '#000', 
            position: 'absolute', 
            height: '100vh', 
            width: '100%', 
            left: 0,
            top: 0
        }}>loading...</div>
    )
}