import { useParams } from 'react-router-dom'

function Category() {
  const { slug } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Categoria: {slug}</h1>
      <p className="mt-2 text-gray-500">Construída na Etapa 10.</p>
    </div>
  )
}

export default Category
