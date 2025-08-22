import React, { useState, useRef, useCallback } from 'react'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export type PhotoType = 'left_profile' | 'right_profile' | 'front_face'

interface PhotoCaptureProps {
  onPhotosChange: (photos: { [key in PhotoType]?: File }) => void
  photos: { [key in PhotoType]?: File }
}

const PHOTO_LABELS: Record<PhotoType, string> = {
  left_profile: 'Perfil Esquerdo',
  right_profile: 'Perfil Direito',
  front_face: 'Frente'
}

const PHOTO_INSTRUCTIONS: Record<PhotoType, string> = {
  left_profile: 'Vire o rosto para a direita (seu perfil esquerdo)',
  right_profile: 'Vire o rosto para a esquerda (seu perfil direito)',
  front_face: 'Olhe diretamente para a câmera'
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotosChange, photos }) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async (photoType: PhotoType) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      
      setStream(mediaStream)
      setCurrentPhotoType(photoType)
      setIsCapturing(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      toast.error('Erro ao acessar a câmera. Verifique as permissões.')
      console.error('Camera access error:', error)
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
    setCurrentPhotoType(null)
  }, [stream])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !currentPhotoType) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${currentPhotoType}.jpg`, { type: 'image/jpeg' })
        const updatedPhotos = { ...photos, [currentPhotoType]: file }
        onPhotosChange(updatedPhotos)
        toast.success(`Foto ${PHOTO_LABELS[currentPhotoType].toLowerCase()} capturada com sucesso!`)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const retakePhoto = (photoType: PhotoType) => {
    const updatedPhotos = { ...photos }
    delete updatedPhotos[photoType]
    onPhotosChange(updatedPhotos)
  }

  const photoTypes: PhotoType[] = ['left_profile', 'front_face', 'right_profile']

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Captura de Fotos para Identificação
        </h3>
        <p className="text-gray-600">
          Capture 3 fotos seguindo as instruções para cada posição
        </p>
      </div>

      {/* Camera View */}
      {isCapturing && currentPhotoType && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="text-center mb-4">
              <h4 className="text-xl font-semibold mb-2">
                {PHOTO_LABELS[currentPhotoType]}
              </h4>
              <p className="text-gray-600 mb-4">
                {PHOTO_INSTRUCTIONS[currentPhotoType]}
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Posicione-se bem e clique em "Capturar"</span>
              </div>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover rounded-lg bg-gray-900"
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute inset-4 border border-blue-300 rounded-lg opacity-50"></div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={stopCamera}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {photoTypes.map((photoType) => (
          <div key={photoType} className="text-center">
            <div className="relative">
              <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {photos[photoType] ? (
                  <img
                    src={URL.createObjectURL(photos[photoType]!)}
                    alt={PHOTO_LABELS[photoType]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Foto não capturada</p>
                  </div>
                )}
              </div>
              
              {photos[photoType] && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <h4 className="font-semibold text-gray-900 mt-3 mb-2">
              {PHOTO_LABELS[photoType]}
            </h4>
            
            <div className="space-y-2">
              {!photos[photoType] ? (
                <button
                  onClick={() => startCamera(photoType)}
                  disabled={isCapturing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar</span>
                </button>
              ) : (
                <button
                  onClick={() => retakePhoto(photoType)}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Progress Indicator */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {photoTypes.map((photoType) => (
            <div
              key={photoType}
              className={`w-3 h-3 rounded-full ${
                photos[photoType] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {Object.keys(photos).length} de 3 fotos capturadas
        </p>
      </div>
    </div>
  )
}

export default PhotoCapture