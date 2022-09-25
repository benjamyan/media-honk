import App from './app';

const PORT = process.env.PORT || 3000;


App.listen(81, '192.168.0.11', (): void => {
    console.log(`server is listening on ${PORT}`)
})

// App.listen(`${PORT}`, (): void => {
    // console.log(`server is listening on ${PORT}`)
    // return void
// })