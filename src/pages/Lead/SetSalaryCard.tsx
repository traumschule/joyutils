import { FC, useEffect, useMemo, useState } from 'react'
import { GetWorkersQuery } from '@/gql/graphql'
import { asJoyPerTerm, formatNumber, joyToHapi } from '@/lib/utils'
import { useLeadStore } from '@/pages/Lead/lead.store'
import { useSettingsStore } from '@/components/Settings'
import { BN } from 'bn.js'
import { WorkingGroup, workingGroups } from './lead.types'
import { JoyCard } from '@/components/JoyCard'
import { UseQueryResult } from '@tanstack/react-query'
import { Combobox } from '@/components/Combobox'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApiContext } from '@/providers/api'
import { useJoystreamWallets } from '@/providers/wallet'

type SetSalaryCardProps = {
  group: WorkingGroup
  workersQuery: UseQueryResult<GetWorkersQuery>
}

const formSchema = z.object({
  workerId: z.number(),
  usdSalary: z.number().nonnegative(),
})
type FormSchema = z.infer<typeof formSchema>
type NullableFormSchema = {
  [K in keyof FormSchema]: FormSchema[K] | null
}

export const SetSalaryCard: FC<SetSalaryCardProps> = ({
  workersQuery,
  group,
}) => {
  const { joyUsdRate, termLength } = useSettingsStore()
  const { wallet, walletAccounts } = useJoystreamWallets()

  const form = useForm<NullableFormSchema>({
    resolver: zodResolver(formSchema),
  })

  const { api } = useApiContext()

  const workerOptions = useMemo(
    () =>
      workersQuery.data?.workers
        .filter((w) => !w.isLead)
        .map((worker) => ({
          label: `${worker.runtimeId} - ${worker.membership.handle}`,
          value: worker.runtimeId.toString(),
        })) ?? [],
    [workersQuery.data?.workers]
  )

  useEffect(() => {
    form.reset({
      workerId: null,
      usdSalary: null,
    })
  }, [group, form.reset])

  const handleSetWorker = (stringId: string) => {
    form.setValue('workerId', parseInt(stringId) ?? null)
    const workers = workersQuery.data?.workers
    if (!workers) return
    const worker = workers.find(
      (worker) => worker.runtimeId === parseInt(stringId)
    )
    if (worker) {
      const usdSalary = asJoyPerTerm(worker.rewardPerBlock) * joyUsdRate

      form.setValue('usdSalary', parseFloat(usdSalary.toFixed(2)))
    } else {
      form.setValue('usdSalary', 0)
    }
  }

  const leadRoleKey = workersQuery.data?.workers.find(
    (w) => w.isLead
  )?.roleAccount

  const handleSubmit = async (data: FormSchema) => {
    if (data.workerId == null || data.usdSalary == null) {
      toast.error('Missing worker or salary')
      return
    }
    if (!wallet) {
      toast.error('Missing wallet')
      return
    }
    const joyPerTerm = data.usdSalary / joyUsdRate
    const hapiPerTerm = joyToHapi(joyPerTerm)
    const hapiPerBlock = hapiPerTerm / BigInt(termLength)
    if (!api) {
      toast.error('Missing API')
      return
    }
    if (
      !leadRoleKey ||
      !walletAccounts.find((a) => a.address === leadRoleKey)
    ) {
      toast.error('Missing lead role key')
      return
    }
    //         .signAndSend(senderAddress, { signer: wallet.signer }, () => {
    //           // do something with result
    //         });
    await api.tx[group]
      .updateRewardAmount(data.workerId, hapiPerBlock.toString())
      .signAndSend(leadRoleKey, { signer: wallet.signer }, (result) => {
        console.log(result)
      })
  }

  const usdSalary = form.watch('usdSalary')
  const joyPerTerm = usdSalary != null ? usdSalary / joyUsdRate : null
  const joyPerBlock = joyPerTerm != null ? joyPerTerm / termLength : null

  return (
    <JoyCard
      title="Set salary"
      isLoading={workersQuery.isLoading}
      isError={workersQuery.isError}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => handleSubmit(d as FormSchema))}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Worker</FormLabel>
                  <Combobox
                    options={workerOptions}
                    value={field.value?.toString() ?? ''}
                    onChange={handleSetWorker}
                    itemName="worker"
                    fullWidth
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usdSalary"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>USD@{joyUsdRate} Salary</FormLabel>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-slate-700 text-sm">
            {joyPerTerm != null && joyPerBlock != null ? (
              <>
                <span>
                  JOY per term = {usdSalary} USD / {joyUsdRate} ={' '}
                  <strong>{formatNumber(joyPerTerm)} JOY</strong>
                </span>
                <br />
                <span>
                  JOY per block = {formatNumber(joyPerTerm)} JOY / {termLength}{' '}
                  blocks = <strong>{formatNumber(joyPerBlock)} JOY</strong>
                </span>
              </>
            ) : (
              'Set salary'
            )}
          </p>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </JoyCard>
  )
}
