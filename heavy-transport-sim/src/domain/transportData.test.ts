import { describe, expect, it } from 'vitest'
import {
  cargoSchema,
  routeSchema,
  validateCargo,
  validateRoute,
  validateVehicle,
  vehicleSchema,
} from './transportData'

describe('transport domain data validation', () => {
  it('accepts valid cargo, vehicle, and route data', () => {
    expect(() =>
      validateCargo({
        id: 'cargo-transformer-001',
        name: 'Main transformer',
        weightTons: 86,
        lengthMeters: 12.5,
        widthMeters: 3.8,
        heightMeters: 4.2,
      }),
    ).not.toThrow()

    expect(() =>
      validateVehicle({
        id: 'vehicle-spmt-001',
        plateNumber: 'HT-2026',
        axleCount: 8,
        maxLoadTons: 120,
        deckLengthMeters: 16,
        deckWidthMeters: 4,
      }),
    ).not.toThrow()

    expect(() =>
      validateRoute({
        id: 'route-port-yard',
        name: 'Port to assembly yard',
        distanceKm: 28.6,
        minBridgeLoadTons: 100,
        minCurveRadiusMeters: 45,
        maxSlopePercent: 4.5,
      }),
    ).not.toThrow()
  })

  it('rejects illegal cargo data', () => {
    const result = cargoSchema.safeParse({
      id: 'cargo-invalid',
      name: 'Invalid cargo',
      weightTons: 0,
      lengthMeters: 12,
      widthMeters: 3,
      heightMeters: 4,
    })

    expect(result.success).toBe(false)
  })

  it('rejects illegal vehicle data', () => {
    const result = vehicleSchema.safeParse({
      id: 'vehicle-invalid',
      plateNumber: 'HT-INVALID',
      axleCount: 1,
      maxLoadTons: 20,
      deckLengthMeters: 8,
      deckWidthMeters: 3,
    })

    expect(result.success).toBe(false)
  })

  it('rejects illegal route data', () => {
    const result = routeSchema.safeParse({
      id: 'route-invalid',
      name: 'Invalid route',
      distanceKm: 12,
      minBridgeLoadTons: 80,
      minCurveRadiusMeters: 0,
      maxSlopePercent: 18,
    })

    expect(result.success).toBe(false)
  })
})
