import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import {
  getUniqueTransportCase,
  validateTransportCase,
  type TransportCase,
} from '../../domain/transportCase'
import { useMemo } from 'react'

const VIEWER_CAMERA_POSITION: [number, number, number] = [12, 8, 12]
const VIEWER_MIN_DISTANCE = 3
const VIEWER_MAX_DISTANCE = 30
const VIEWER_MAX_POLAR = Math.PI / 2.1

function CargoPlaceholderModel({
  dimensions,
}: {
  dimensions: { lengthM: number; widthM: number; heightM: number }
}) {
  const { lengthM, widthM, heightM } = dimensions
  const scale = 0.5
  const w = widthM * scale
  const h = heightM * scale
  const d = lengthM * scale

  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#5b8c85" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w + 0.2, 0.05, d + 0.2]} />
        <meshStandardMaterial color="#999" roughness={0.8} />
      </mesh>
      <Html position={[w / 2 + 0.5, h / 2, 0]} center>
        <div
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          宽 {dimensions.widthM}m
        </div>
      </Html>
      <Html position={[0, h + 0.5, 0]} center>
        <div
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          高 {dimensions.heightM}m
        </div>
      </Html>
      <Html position={[0, h / 2, d / 2 + 0.5]} center>
        <div
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          长 {dimensions.lengthM}m
        </div>
      </Html>
    </group>
  )
}

function ViewerLoading() {
  return (
    <Html center>
      <div style={{ color: '#666', fontSize: '14px' }}>正在加载货物模型...</div>
    </Html>
  )
}

function CargoScene({ cargo }: { cargo: NonNullable<TransportCase['cargo']> }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 8]} intensity={0.8} />
      <hemisphereLight args={['#87ceeb', '#444444', 0.3]} />
      <Suspense fallback={<ViewerLoading />}>
        <CargoPlaceholderModel dimensions={cargo.dimensions} />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, cargo.dimensions.heightM * 0.25, 0]}
        minDistance={VIEWER_MIN_DISTANCE}
        maxDistance={VIEWER_MAX_DISTANCE}
        maxPolarAngle={VIEWER_MAX_POLAR}
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  )
}

type PageState =
  | { status: 'ready'; data: TransportCase }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'error'; message: string }

function loadCase(): PageState {
  try {
    const raw = getUniqueTransportCase()
    if (!raw) return { status: 'empty' }
    const data = validateTransportCase(raw)
    return { status: 'ready', data }
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return { status: 'validation_error', message: '案例数据校验失败。' }
    }
    return { status: 'error', message: '加载案例数据时发生错误。' }
  }
}

export default function Cargo360Viewer() {
  const state = useMemo(() => loadCase(), [])

  const handleReset = useCallback(() => {
    window.location.reload()
  }, [])

  if (state.status === 'empty') {
    return (
      <div
        data-testid="cargo-viewer-empty"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>未找到案例数据。</p>
      </div>
    )
  }

  if (state.status === 'validation_error' || state.status === 'error') {
    return (
      <div
        data-testid="cargo-viewer-error"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  const { data } = state
  const { cargo } = data

  return (
    <div
      data-testid="cargo-360-viewer"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <h1>货物 360° 查看</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        拖拽可旋转查看货物，滚轮可缩放，点击"复位视角"回到默认观察角度。
      </p>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1 1 500px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            minHeight: '400px',
            position: 'relative',
          }}
        >
          <Canvas
            data-testid="cargo-canvas"
            camera={{
              position: VIEWER_CAMERA_POSITION,
              fov: 50,
              near: 0.1,
              far: 100,
            }}
            style={{ width: '100%', height: '400px' }}
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
              gl.setClearColor('#f0f0f0')
            }}
          >
            <CargoScene cargo={cargo} />
          </Canvas>
          <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
            <button
              data-testid="reset-view-btn"
              onClick={handleReset}
              style={{
                padding: '6px 16px',
                border: '1px solid #3d85c6',
                borderRadius: '4px',
                background: '#fff',
                color: '#3d85c6',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              复位视角
            </button>
          </div>
        </div>

        <div
          data-testid="cargo-dimensions"
          style={{
            flex: '0 0 280px',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #e8e8e8',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>{cargo.name}</h2>
          <div
            style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}
          >
            {cargo.category}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e8e8e8' }}>
                <th style={thStyle}>参数</th>
                <th style={thStyle}>数值</th>
                <th style={thStyle}>单位</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>长度</td>
                <td style={tdStyle} data-testid="cargo-length">
                  {cargo.dimensions.lengthM}
                </td>
                <td style={tdStyle}>m</td>
              </tr>
              <tr>
                <td style={tdStyle}>宽度</td>
                <td style={tdStyle} data-testid="cargo-width">
                  {cargo.dimensions.widthM}
                </td>
                <td style={tdStyle}>m</td>
              </tr>
              <tr>
                <td style={tdStyle}>高度</td>
                <td style={tdStyle} data-testid="cargo-height">
                  {cargo.dimensions.heightM}
                </td>
                <td style={tdStyle}>m</td>
              </tr>
              <tr>
                <td style={tdStyle}>重量</td>
                <td style={tdStyle} data-testid="cargo-weight">
                  {cargo.weightT}
                </td>
                <td style={tdStyle}>t</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            {cargo.description}
          </div>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  fontSize: '13px',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #eee',
  fontSize: '13px',
}
