import { z } from 'zod'

const idSchema = z.string().trim().min(1)
const nameSchema = z.string().trim().min(1)

export const cargoSchema = z.object({
  id: idSchema,
  name: nameSchema,
  weightTons: z.number().positive(),
  lengthMeters: z.number().positive(),
  widthMeters: z.number().positive(),
  heightMeters: z.number().positive(),
})

export const vehicleSchema = z.object({
  id: idSchema,
  plateNumber: idSchema,
  axleCount: z.number().int().min(2),
  maxLoadTons: z.number().positive(),
  deckLengthMeters: z.number().positive(),
  deckWidthMeters: z.number().positive(),
})

export const routeSchema = z.object({
  id: idSchema,
  name: nameSchema,
  distanceKm: z.number().positive(),
  minBridgeLoadTons: z.number().positive(),
  minCurveRadiusMeters: z.number().positive(),
  maxSlopePercent: z.number().min(0).max(12),
})

export type Cargo = z.infer<typeof cargoSchema>
export type Vehicle = z.infer<typeof vehicleSchema>
export type Route = z.infer<typeof routeSchema>

export const validateCargo = (cargo: unknown): Cargo => cargoSchema.parse(cargo)

export const validateVehicle = (vehicle: unknown): Vehicle =>
  vehicleSchema.parse(vehicle)

export const validateRoute = (route: unknown): Route => routeSchema.parse(route)
