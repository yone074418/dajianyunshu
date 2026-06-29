import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigurationLogStore } from './configurationLogStore'

describe('ConfigurationLogStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useConfigurationLogStore.getState().clearLogs()
  })

  it('starts with empty logs', () => {
    const state = useConfigurationLogStore.getState()
    expect(state.logs).toEqual([])
    expect(state.errorCount).toBe(0)
    expect(state.modificationCount).toBe(0)
  })

  describe('logCombinationSelected', () => {
    it('logs combination selection', () => {
      useConfigurationLogStore
        .getState()
        .logCombinationSelected('combo-a', '组合A')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(1)
      expect(state.logs[0].eventType).toBe('combination_selected')
      expect(state.logs[0].resultStatus).toBe('selected')
      expect(state.previousSelections.vehicleCombinationId).toBe('combo-a')
    })

    it('logs combination change and increments modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logCombinationSelected('combo-a', '组合A')
      store.logCombinationSelected('combo-b', '组合B')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(2)
      expect(state.logs[1].eventType).toBe('combination_changed')
      expect(state.logs[1].resultStatus).toBe('changed')
      expect(state.modificationCount).toBe(1)
    })

    it('selecting same value does not increment modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logCombinationSelected('combo-a', '组合A')
      store.logCombinationSelected('combo-a', '组合A')
      const state = useConfigurationLogStore.getState()
      expect(state.modificationCount).toBe(0)
    })
  })

  describe('logTractorSelected', () => {
    it('logs tractor selection', () => {
      useConfigurationLogStore
        .getState()
        .logTractorSelected('tractor-6x6', '6x6牵引车')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(1)
      expect(state.logs[0].eventType).toBe('tractor_selected')
      expect(state.previousSelections.tractorId).toBe('tractor-6x6')
    })

    it('logs tractor change and increments modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logTractorSelected('tractor-6x6', '6x6牵引车')
      store.logTractorSelected('tractor-8x8', '8x8牵引车')
      const state = useConfigurationLogStore.getState()
      expect(state.logs[1].eventType).toBe('tractor_changed')
      expect(state.modificationCount).toBe(1)
    })

    it('selecting same tractor does not increment modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logTractorSelected('tractor-6x6', '6x6牵引车')
      store.logTractorSelected('tractor-6x6', '6x6牵引车')
      expect(useConfigurationLogStore.getState().modificationCount).toBe(0)
    })
  })

  describe('logAxleLinesSelected', () => {
    it('logs axle lines selection', () => {
      useConfigurationLogStore.getState().logAxleLinesSelected(6, '6轴线')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(1)
      expect(state.logs[0].eventType).toBe('trailer_axle_lines_selected')
      expect(state.previousSelections.axleLines).toBe(6)
    })

    it('logs axle lines change and increments modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logAxleLinesSelected(6, '6轴线')
      store.logAxleLinesSelected(8, '8轴线')
      const state = useConfigurationLogStore.getState()
      expect(state.logs[1].eventType).toBe('trailer_axle_lines_changed')
      expect(state.modificationCount).toBe(1)
    })

    it('selecting same axle lines does not increment modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logAxleLinesSelected(6, '6轴线')
      store.logAxleLinesSelected(6, '6轴线')
      expect(useConfigurationLogStore.getState().modificationCount).toBe(0)
    })
  })

  describe('logColumnsSelected', () => {
    it('logs columns selection', () => {
      useConfigurationLogStore.getState().logColumnsSelected(2, '2纵列')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(1)
      expect(state.logs[0].eventType).toBe('trailer_columns_selected')
      expect(state.previousSelections.columns).toBe(2)
    })

    it('logs columns change and increments modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logColumnsSelected(1, '1纵列')
      store.logColumnsSelected(2, '2纵列')
      const state = useConfigurationLogStore.getState()
      expect(state.logs[1].eventType).toBe('trailer_columns_changed')
      expect(state.modificationCount).toBe(1)
    })

    it('selecting same columns does not increment modification count', () => {
      const store = useConfigurationLogStore.getState()
      store.logColumnsSelected(2, '2纵列')
      store.logColumnsSelected(2, '2纵列')
      expect(useConfigurationLogStore.getState().modificationCount).toBe(0)
    })
  })

  describe('logConfigurationChecked', () => {
    it('logs passed check without incrementing error count', () => {
      useConfigurationLogStore
        .getState()
        .logConfigurationChecked('passed', '方案通过')
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(1)
      expect(state.logs[0].eventType).toBe('configuration_passed')
      expect(state.errorCount).toBe(0)
    })

    it('logs failed check and increments error count', () => {
      useConfigurationLogStore
        .getState()
        .logConfigurationChecked('failed', '方案不通过', '重量超出')
      const state = useConfigurationLogStore.getState()
      expect(state.logs[0].eventType).toBe('configuration_failed')
      expect(state.errorCount).toBe(1)
      expect(state.lastFailedLog).not.toBeNull()
      expect(state.lastFailedLog!.reason).toBe('重量超出')
    })

    it('logs blocked check and increments error count', () => {
      useConfigurationLogStore
        .getState()
        .logConfigurationChecked('blocked', '缺少参数', '缺少组合方式')
      const state = useConfigurationLogStore.getState()
      expect(state.logs[0].eventType).toBe('configuration_blocked')
      expect(state.errorCount).toBe(1)
    })

    it('rapid repeated check does not infinitely increase error count', () => {
      const store = useConfigurationLogStore.getState()
      for (let i = 0; i < 10; i++) {
        store.logConfigurationChecked('failed', '方案不通过', '重量超出')
      }
      const state = useConfigurationLogStore.getState()
      expect(state.errorCount).toBe(10)
      expect(state.logs.length).toBe(10)
    })
  })

  describe('loadLogs', () => {
    it('loads persisted logs from localStorage', () => {
      const store = useConfigurationLogStore.getState()
      store.logCombinationSelected('combo-a', '组合A')
      store.logConfigurationChecked('passed', '通过')

      const newStore = useConfigurationLogStore.getState()
      newStore.loadLogs()
      const state = useConfigurationLogStore.getState()
      expect(state.logs.length).toBe(2)
    })
  })

  describe('clearLogs', () => {
    it('clears all logs and resets counts', () => {
      const store = useConfigurationLogStore.getState()
      store.logCombinationSelected('combo-a', '组合A')
      store.logConfigurationChecked('failed', '不通过', '原因')
      store.clearLogs()
      const state = useConfigurationLogStore.getState()
      expect(state.logs).toEqual([])
      expect(state.errorCount).toBe(0)
      expect(state.modificationCount).toBe(0)
    })
  })
})
