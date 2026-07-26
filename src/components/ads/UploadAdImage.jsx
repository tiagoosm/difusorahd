import FileUpload from '../ui/FileUpload'

function UploadAdImage({ value, onChange }) {
  return (
    <FileUpload
      label="Imagem do anúncio"
      kind="image"
      accept="image/*"
      bucket="ads-images"
      folder="banners"
      value={value}
      onChange={onChange}
    />
  )
}

export default UploadAdImage
