'use client'

import React from 'react'

import { Card } from '@/components/ui'

import type { SmartMoneyTokenInflow } from '@/services/hellomoon/types'
import type { Price, TokenMetadata } from '@/services/birdeye/types'

interface Props {
    inflow: SmartMoneyTokenInflow;
    token: TokenMetadata;
    price: Price;
}

const SmartMoneyToken: React.FC<Props> = ({ inflow, token, price }) => {

    return (
        <Card className="flex flex-col gap-2 p-2 justify-center">
            <div className="flex flex-row items-center gap-2">
                <img 
                    src={token.logo_uri} 
                    alt={token.name} 
                    className="w-10 h-10 rounded-full" 
                />
                <div className="flex flex-col">
                    <p className="text-sm font-bold">{token.name} ({token.symbol})</p>
                    <p className="text-xs text-muted-foreground">${price.value.toLocaleString(undefined, { maximumFractionDigits: 5})} {price.priceChange24h !== 0 && <span className={price.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}>({price.priceChange24h > 0 ? '+' : ''}{price.priceChange24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}%)</span>}</p>
                </div>
            </div>
            <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Net inflow: ${inflow.smartMoneyNetInflow?.toLocaleString()}</p>
            </div>
        </Card>
    )
}

export default SmartMoneyToken