
import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { format, addDays, subMonths, startOfMonth, endOfMonth, getHours, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BarChart, PieChart, Tooltip, Legend, Cell, Bar, Pie, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, BarChart3, PieChart as PieChartIcon, Users, Clock } from 'lucide-react';

const timeRanges = [
  { value: '1month', label: '1 месяц' },
  { value: '3months', label: '3 месяца' },
  { value: '9months', label: '9 месяцев' },
  { value: '12months', label: '1 год' },
  { value: 'custom', label: 'Выбрать период' }
];

const AnalyticsView = () => {
  const [selectedRange, setSelectedRange] = useState('1month');
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [customDateRange, setCustomDateRange] = useState(false);
  
  const getZoneById = useStore((state) => state.getZoneById);
  const bookings = useStore((state) => state.bookings);
  const zones = useStore((state) => state.zones);
  
  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    
    if (value === 'custom') {
      setCustomDateRange(true);
      return;
    }
    
    setCustomDateRange(false);
    
    const now = new Date();
    
    switch (value) {
      case '1month':
        setStartDate(subMonths(now, 1));
        break;
      case '3months':
        setStartDate(subMonths(now, 3));
        break;
      case '9months':
        setStartDate(subMonths(now, 9));
        break;
      case '12months':
        setStartDate(subMonths(now, 12));
        break;
    }
    
    setEndDate(now);
  };
  
  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.dateTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }, [bookings, startDate, endDate]);
  
  const zoneOccupancyData = useMemo(() => {
    const zoneCount = new Map<string, number>();
    
    // Initialize with all zones
    zones.forEach(zone => {
      zoneCount.set(zone.id, 0);
    });
    
    filteredBookings.forEach(booking => {
      zoneCount.set(booking.zoneId, (zoneCount.get(booking.zoneId) || 0) + 1);
    });
    
    return Array.from(zoneCount.entries())
      .map(([zoneId, count]) => ({
        name: getZoneById(zoneId)?.name || 'Неизвестно',
        value: count
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredBookings, zones, getZoneById]);
  
  const zoneTypeData = useMemo(() => {
    const zoneTypeCount = new Map<string, number>();
    
    filteredBookings.forEach(booking => {
      const zone = getZoneById(booking.zoneId);
      if (zone) {
        zoneTypeCount.set(zone.type, (zoneTypeCount.get(zone.type) || 0) + 1);
      }
    });
    
    return Array.from(zoneTypeCount.entries())
      .map(([type, count]) => ({
        name: type,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredBookings, getZoneById]);
  
  const hourlyDistributionData = useMemo(() => {
    const hourlyCount = Array(24).fill(0);
    
    filteredBookings.forEach(booking => {
      const bookingDate = parseISO(booking.dateTime);
      const hour = getHours(bookingDate);
      hourlyCount[hour]++;
    });
    
    return hourlyCount.map((count, hour) => ({
      name: `${hour}:00`,
      count
    })).filter(item => item.count > 0);
  }, [filteredBookings]);
  
  const guestCountDistribution = useMemo(() => {
    const guestDistribution = new Map<number, number>();
    
    filteredBookings.forEach(booking => {
      guestDistribution.set(
        booking.personCount,
        (guestDistribution.get(booking.personCount) || 0) + 1
      );
    });
    
    return Array.from(guestDistribution.entries())
      .map(([guestCount, count]) => ({
        name: `${guestCount} чел.`,
        count
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [filteredBookings]);
  
  const totalBookings = filteredBookings.length;
  const totalGuests = filteredBookings.reduce((sum, booking) => sum + booking.personCount, 0);
  const averageGuestsPerBooking = totalBookings > 0 ? totalGuests / totalBookings : 0;
  
  const COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#9C27B0', '#2196F3'];
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Статистика бронирований
          </CardTitle>
          <CardDescription>
            Аналитика бронирований и гостей за выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <Select value={selectedRange} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {customDateRange && (
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ru }) : (
                        <span>Начальная дата</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={ru}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span>—</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ru }) : (
                        <span>Конечная дата</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={ru}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Всего бронирований</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalBookings}</div>
            <p className="text-sm text-muted-foreground mt-1">За выбранный период</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Всего гостей</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalGuests}</div>
            <p className="text-sm text-muted-foreground mt-1">Общее количество за период</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Средняя загрузка</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{averageGuestsPerBooking.toFixed(1)} <span className="text-base">гостей</span></div>
            <p className="text-sm text-muted-foreground mt-1">В среднем на одно бронирование</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Занятость зон</span>
            </CardTitle>
            <CardDescription>
              Количество бронирований по каждой зоне за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {zoneOccupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={zoneOccupancyData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
                    />
                    <Tooltip formatter={(value) => [`${value} бронирований`, 'Количество']} />
                    <Bar dataKey="value" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              <span>Распределение по типам зон</span>
            </CardTitle>
            <CardDescription>
              Популярность различных типов зон за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {zoneTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="count"
                      nameKey="name"
                      data={zoneTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {zoneTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} бронирований`, 'Количество']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Часы пиковой нагрузки</span>
            </CardTitle>
            <CardDescription>
              Распределение бронирований по часам дня
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {hourlyDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} бронирований`, 'Количество']} />
                    <Bar dataKey="count" fill="#8BC34A" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Распределение количества гостей</span>
            </CardTitle>
            <CardDescription>
              Соотношение бронирований по количеству гостей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {guestCountDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={guestCountDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} бронирований`, 'Количество']} />
                    <Bar dataKey="count" fill="#FFC107" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsView;
