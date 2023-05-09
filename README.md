# Media HONK
Local media server meant to run over HTTP/S. Provides a client, api, and database to store, browse and use media files.

Building in: TS, mySQL, SQL, React

## Adding media

### Properties archetype overview:
Must be named `properties.yaml`
Anything @optional can be passed as NULL, or not at all. Both will render it as `undefined`
Any file that does not contain required fields will be ignored completely (media will not be sent to client)
- title: Display name of the media to be shown in client
  > @required 
  > @type String
- subtitle: series number, collection number, etc... 
  > @optional 
  > @type String
- type: the media classification
  > @required
  > @type String literal
  > @options `series` | `movie` | `singles` | `album` | `gallery`
- artists: any associated artists/actors/singers exactly
  > @optional 
  > @type String list
- categories: media categories for further classification
  > @optional
  > @type String list | String literal list
  > @options `Multiple` `Unknown`

### All media
- Each directory containing a media type to be used by client must contain:
  > a properties.yaml file containing necessary information (title and type are required)
  > the pertinent media file 
- Each directory should have an image file to be used as a cover. This is optional, but recommended. No naming convention is followed, but VLC recognizes `cover.{ext}` rules
- The `properties.yaml` file serves as a flag telling the application that this is the location of media desired to be shared with client

### Video media
- A seperate audio track should follow the naming convention of its corresponding video file exactly. Eg.:
  > my_super_video.mp4
  > my_super_audio.mp3
- If it is a VR video file, it needs to be appended with its relevant composite info. Eg.:
  > my_super_video_180_180x180_3dh_LR.mp4
- If an image gellery is attached to it, the directory containing the image files must be named `gallery` - it must follow image gallery rules, but does not need a properties.yaml file

### A media with type `series` | `album`:
- Must have a parent directory which is the name of the artist (for sanity purposes). Recommended, not required
  > That parent directory should contain each seperate entity (album/season) as a sub-directory
- The directories containing the media files should each have a `properties.yaml` file which contains series/album information
- The sub-directories should contain that entities cover image

### Directories with more than one media entry:
- The title of the media should follow a simple format:
  > series: s1e1_title_of_media.{video}
  > album: 01_title_of_media.{audio}
  > gallery: 01.{image}
