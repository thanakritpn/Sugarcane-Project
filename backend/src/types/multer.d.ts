// Minimal declaration to satisfy TypeScript when @types/multer is not installed.
// Provide a default export of type `any` so `import multer from 'multer'` works.
declare module 'multer' {
	const multer: any
	export default multer
}
