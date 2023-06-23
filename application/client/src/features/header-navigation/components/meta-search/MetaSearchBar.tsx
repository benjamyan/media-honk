import React, { useState } from 'react';

import './_MetaSearchBar.scss';
import { useAssetLibraryContext } from '../../../../context';

export const MetaSearchBar = () => {
	const { metaArtistBucket, metaCategoryBucket, updateLibraryContext } = useAssetLibraryContext();
	const [ dropdownValues, setDropdownValues ] = useState<string[]>([]);

	return (
		<div className='meta__search'>
			<input 
				placeholder='Search' 
				onChange={(event)=> {
					if (event.target.value.length == 0) return;
					for (const metaValue of [...metaArtistBucket, ...metaCategoryBucket]) {
						if (event.target.value.toLowerCase().indexOf(metaValue.toLowerCase()) == -1 || dropdownValues.includes(metaValue)) continue;
						setDropdownValues([...dropdownValues, metaValue]);
					}
				}}
			/>
			{ dropdownValues.length > 0 && 
				<div>
					{ dropdownValues.map((value)=> (
						<p onClick={ (event)=> updateLibraryContext({ action: 'UPDATE', payload: event.currentTarget.textContent }) }>{ value }</p>
					)) }
				</div>
			}
		</div>
	)
}
