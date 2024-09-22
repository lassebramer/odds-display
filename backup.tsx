"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Range } from 'react-range';

import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Type } from "lucide-react"
import axios from "axios"
import { json } from "express"

type ValueBet = {
  GameID: string
  Season: string
  Date: string
  League: string
  HomeTeam: string
  AwayTeam: string
  BetType: string
  Line: number
  Odds: number
  Value: number
  Result: number | null
  Profit: Number
}


function MultiSelect({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 border rounded-md w-full text-left flex justify-between items-center"
      >
        {selected.length === 0 ? 'All Leagues' : `${selected.length} selected`}
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <div
              key={option}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => toggle(option)}
            >
              {option}
              {selected.includes(option) && <Check className="w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ValueBetsDisplay() {
  const [valueBets, setValueBets] = useState<ValueBet[]>([])
  const [search, setSearch] = useState("")

  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])
  const [selectedSeason, setSelectedSeason] = useState("")
  const [selectedValue, setSelectedValue] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof ValueBet | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");


  const [loading, setLoading] = useState<boolean>(true); // State to handle loading
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const itemsPerPage = 5000

  useEffect(() => {
    // In a real application, you would fetch data from your API here
    console.log("sdfsdf")
    axios.get('http://localhost:4000/api/value-bets')
      .then(response => {
        const json_data = response.data.data
        console.log(json_data)
        var new_data = []

        for (var val of json_data){
          switch (val['Result']){
            case 1: 
              val["Profit"] = val["Odds"]-1;
              break;
            case 0: 
              val["Profit"] = 0;
              break;
            case -1: 
              val["Profit"] = -1;
              break;
            default:
              val["Profit"] = 0
              break;
          }
          new_data.push(val)
        
      }

        
        setValueBets(new_data); // Assuming the data is in response.data.data
        setLoading(false); // Data is loaded, stop loading
      })
      .catch(err => {
        setError('Error fetching data'); // Set an error message
        setLoading(false); // Stop loading even in case of error
      });
  }, []); // Empty dependency array to run the effect only once on component mount


  const getMinValue = () => {
    const floatVal = parseFloat(minValue);
    return isNaN(floatVal) ? 0 : floatVal;
  };

  const getMaxValue = () => {
    const floatVal = parseFloat(maxValue);
    return isNaN(floatVal) ? 100000000 : floatVal;
  };

  const filteredAndSortedBets = useMemo(() => {
    return valueBets
      .filter(bet => 
        (bet.HomeTeam.toLowerCase().includes(search.toLowerCase()) ||
         bet.AwayTeam.toLowerCase().includes(search.toLowerCase())) &&
        (selectedLeagues.length === 0 || selectedLeagues.includes(bet.League)) &&
        (selectedSeason === "" || bet.Season === selectedSeason) && 
        bet.Value > getMinValue()  &&
        bet.Value < getMaxValue()
      )
      .sort((a, b) => {
        if (!sortColumn)  return 0
        if (!a[sortColumn])  return 0
        if (!b[sortColumn])  return 0
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
  }, [valueBets, search, selectedLeagues, selectedSeason, sortColumn, sortDirection,minValue,maxValue])

  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedBets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedBets, currentPage])

  const uniqueLeagues = Array.from(new Set(valueBets.map(bet => bet.League)))
  const uniqueSeasons = Array.from(new Set(valueBets.map(bet => bet.Season)))

  const handleSort = (column: keyof ValueBet) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ column }: { column: keyof ValueBet }) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Value Bets Display</h1>
      <div style={{ padding: '20px' }}>
     
    </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <select
          multiple
          value={selectedLeagues}
          onChange={(e) => setSelectedLeagues(Array.from(e.target.selectedOptions, option => option.value))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Leagues</option>
          {uniqueLeagues.map(league => (
            <option key={league} value={league}>{league}</option>
          ))}
        </select>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Seasons</option>
          {uniqueSeasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Values</option>
            <option key={'1.05'} value={1.05}>{1.05}</option>
        </select>
        <input
          type="text"
          placeholder="Min Value"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Max Value"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">League</th>
              <th className="p-2 text-left">Home Team</th>
              <th className="p-2 text-left">Away Team</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("BetType")}>
                Bet Type<SortIcon column="BetType" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("Line")}>
                Line <SortIcon column="Line" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("Odds")}>
                Odds <SortIcon column="Odds" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("Value")}>
                Value <SortIcon column="Value" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("Result")}>
                Result <SortIcon column="Result" />
              </th>
              <th className="p-2 text-left">Profit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBets.map((bet) => (
              <tr key={`${bet.GameID}-${bet.BetType}`} className="border-b hover:bg-gray-50">
                <td className="p-2">{bet.Date}</td>
                <td className="p-2">{bet.League}</td>
                <td className="p-2">{bet.HomeTeam}</td>
                <td className="p-2">{bet.AwayTeam}</td>
                <td className="p-2">{bet.BetType}</td>
                <td className="p-2">{bet.Line}</td>
                <td className="p-2">{bet.Odds.toFixed(2)}</td>
                <td className="p-2">{bet.Value.toFixed(2)}</td>
                <td className={`p-2 font-medium ${
                  bet.Result === 2 ? 'text-yellow-500' :
                  bet.Result === 1 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {bet.Result === 2 ? 'Pending' : bet.Result === 1 ? 'Won' : 'Lost'}
                </td>
                <td className="p-2">{bet.Profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedBets.length)} of {filteredAndSortedBets.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAndSortedBets.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredAndSortedBets.length / itemsPerPage)}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}