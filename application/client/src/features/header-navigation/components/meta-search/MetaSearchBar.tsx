import React, { EventHandler, MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';

import './_MetaSearchBar.scss';
import { useAssetLibraryContext } from '../../../../context';

type MetaSearchBarProps = {
	updateSearchFocus: (focused: boolean)=> void;
	// updateSearchValue: (args:{ action: 'ADD' | 'REMOVE', value: string | null })=> void
}

export const MetaSearchBar = ({ updateSearchFocus }: MetaSearchBarProps) => {
	const { metaArtistBucket, metaCategoryBucket, metaSearch, updateLibraryContext } = useAssetLibraryContext();
	const [ searchValues, setSearchValues ] = useState<string[]>([...metaSearch]);
	const [ inputActive, setInputActive ] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const onInputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>)=> {
		if (event.target.value.length == 0) return setSearchValues([]);
		const isPossibleSearchValue = (metaValue: string)=> (
			metaValue.toLowerCase().startsWith(event.target.value.toLowerCase())
		);
		for (const metaValue of [...metaArtistBucket, ...metaCategoryBucket]) {
			if (!isPossibleSearchValue(metaValue)) {
				if (searchValues.includes(metaValue)) {
					searchValues.splice(searchValues.findIndex((searchValue)=> searchValue == metaValue), 1);
					setSearchValues([...searchValues]);
				}
			} else if (!searchValues.includes(metaValue)) {
				searchValues.push(metaValue);
				setSearchValues([...searchValues]);
			}
		}
	};
	const onInputClearEventHandler = ()=> {
		setSearchValues([]);
		if (searchInputRef?.current?.value.length == 0) {
			setInputActive(false);
		}
		if (searchInputRef.current !== null) {
			searchInputRef.current.value = '';
		}
		document.removeEventListener('click', onInputClearEventHandler);
	};
	const onMetaSearchValueClickHandler: MouseEventHandler<HTMLParagraphElement> = (event)=> {
		updateLibraryContext({
			action: 'UPDATE',
			payload: {
				metaSearch: event.currentTarget.textContent!
			}
		});
		onInputClearEventHandler();
	};

	const MetaSearchDropdown = useCallback(()=> {
		if (searchValues.length == 0) return null;
		return (
			<div className='meta__search--dropdown'>
				{ searchValues.map((value)=> (
					<p onClick={onMetaSearchValueClickHandler}>{ value }</p>
				)) }
			</div>
		)
	}, [ searchValues ]);

	useEffect(()=> {
		if (searchValues.length == 1) {
			document.addEventListener('click', onInputClearEventHandler);
		}
	}, [ searchValues ]);
	useEffect(()=>{
		updateSearchFocus(inputActive);
	}, [ inputActive ]);

	return (
		<div className={`meta__search ${inputActive ? 'active' : ''}`}>
			{ inputActive &&
				<input ref={searchInputRef} placeholder='Search' onChange={onInputChangeHandler} />
			}
			<button onClick={inputActive ? onInputClearEventHandler : ()=> setInputActive(true)}>
				{ !inputActive ? 'Search' : 'X' }
			</button>
			<MetaSearchDropdown />
		</div>
	)
}
