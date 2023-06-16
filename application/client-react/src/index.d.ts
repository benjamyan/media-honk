// declare global {
//     namespace HonkConfig {
//         export interface honkConfig {
//             ENV: 'staging' | 'development' | 'production';
//         }
//         // export type ENV = 'staging' | 'development' | 'production';
//     }
// }
declare var honkConfig: {
    ENV: 'staging' | 'development' // | 'production'
} = {
    ENV
    // ENV: 'staging' | 'development' | 'production'
}