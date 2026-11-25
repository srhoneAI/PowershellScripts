
# Frequently used Powershell commands

## Find Windows services, start, stop, set credentials etc

### Get service, start/stop
Get-Service -Name MyServiceName | Stop-Service

Get-Service -Name MyService | ? { $_.StartType -ne 'Disabled' } | Start-Service
Get-Service -Name MyService | ? StartType -ne Disabled | Start-Service

Get-WmiObject -Class Win32_Service -ComputerName $ServerName -Filter "DisplayName like '%MyServiceName%'" | Select-Object PSComputerName, Name, StartName
Get-WmiObject -Class Win32_Service -ComputerName $ServerName -Filter "DisplayName like '%MyServiceName%' -or DisplayName like '%TheOtherService%' " | Select-Object PSComputerName, Name, StartName

### Set service credentials locally
(Get-WmiObject -Class Win32_Service -Filter "name='ServiceName'").Change($null,$null,$null,$null,$null,$null,'Corp\ServiceAccount', PWD)

### Set service credentials on remote servers
Get-CimInstance -ComputerName $ServerNameOne, $ServerNameTwo -ClassName Win32_Service -Filter "Name='ServiceName'" | Invoke-CimMethod -MethodName Change -Arguments @{StartName = 'Corp\ServiceAccount' StartPassword = 'PWD'}

### Test existence of folder or file

function Test-Folder-Existence{
	[CmdletBinding()]
	param(
		[Parameter(Mandatory)]
		$PathToFolder
	)

	return (Test-Path -Path $PathToFolder -PathType Container)

}

function Test-File-Existence{
	[CmdletBinding()]
	param(
		[Parameter(Mandatory)]
		$PathToFile
	)

	return (Test-Path -Path $PathToFolder -PathType Leaf)

}

## Arrays

### Basic array

$colors = "Red", "Green", "Purple"

### Add range of servers to array
$NonProductionServers = @()
$NonProductionServers += 1..100 | ForEach-Object{"ServerNamePattern{0:D2}" -f $_}