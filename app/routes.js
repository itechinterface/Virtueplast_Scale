module.exports = function(app,io) {

	var exec = require('child_process').exec;
	var fs = require('fs');
	//var gpio = require('rpi-gpio');

	var logger_path = "/home/pi/shipper_log.csv";
	var force_print_logger_path = "/home/pi/shipper_forceprint_log.csv";



	getGeneralSettings();
	var mysql = require('mysql');

	// GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'accent@123' WITH GRANT OPTION;
	// FLUSH PRIVILEGES;

	var con = mysql.createConnection({
		host: "cloud-db.c1aefstrp0sv.ap-south-1.rds.amazonaws.com",
		user: "admin",
		password: "Satyamev516",
		database: "virtueplast_latest",
		acquireTimeout: 1000000
	});

	// var con = mysql.createConnection({
	// 	host: "68.178.162.131",
	// 	user: "admin",
	// 	password: "Virtueplast@2023",
	// 	database: "virtueplast",
	// 	acquireTimeout: 1000000
	// });

	// var con = mysql.createConnection({
	// 	host: "192.168.0.8",
	// 	user: "admin",
	// 	password: "accent@123",
	// 	database: "virtueplast",
	// 	acquireTimeout: 1000000
	// });

        /*var con = mysql.createConnection({
		host: "itechdbinstance.civspk3jyqek.ap-south-1.rds.amazonaws.com",
		user: "itechinterface",
		password: "Password1904",
		database: "virtueplast",
		acquireTimeout: 1000000
	});*/

	var scale_id = fs.readFileSync('scale_id', 'utf8');
	scale_id = parseInt(scale_id);
	console.log(parseInt(scale_id));
	
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	function log(req) {
		return;
		var date = new Date();
		var stringArray = [];
		stringArray.push("DateTime : ",date);
		stringArray.push("URL : ",req.url);
		stringArray.push("\n");

		setTimeout(function () {
			fs.appendFile(logger_path,stringArray.toString()
				, function (err) {

				});
		},1000);
	}

	function forcePrintLog(data) {
		return;
		setTimeout(function () {
			fs.appendFile(force_print_logger_path,data.toString()
				, function (err) {

				});
		},1000);
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function reverse(str){
		var reversed = "";
		for (var i = str.length - 1; i >= 0; i--){
			reversed += str[i];
		}
		return reversed;
	}

	/*
	var delay = 1000;
	gpio.destroy();
	gpio.reset();

	gpio.on('export', function(channel) {
		console.log('Channel set: ' + channel);
	});


	var prevValue = false;
	gpio.on('change', function(channel, value) {
		//console.log('Channel ' + channel + ' value is now ' + value);
		if(value == true && prevValue == false){
                        //setTimeout(function () {
                            io.sockets.emit('forceprint', true);
                            console.log("Triggered...");
                        //},1500);
                }
		prevValue = value;
	});

	gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);
	*/
	//var SerialPort = require('serialport');
        //const Readline = SerialPort.parsers.Readline;
        
	function getGeneralSettings() {

		var final_string = "";
		try {
			if (fs.existsSync('/dev/ttyUSB0')) {
				var result = exec("echo RaspberryPi | sudo -S chmod a+rw /dev/ttyUSB0", function (error, stdout, stderr) {
					port = new SerialPort('/dev/ttyUSB0', {
						baudRate: 9600,
						parser: SerialPort.parsers.readline("\n")
					});
					var str = '';
					port.on('open', function () {
						console.log("Open");
						port.on('data', function (data) {


                                                        /*var data = data.toString('utf8');
                                                        console.log(data);
                                                        data = data.replace(' ','');
                                                        data = data.replace('\r','');
                                                        data = data.replace('\n','');

                                                        if(data.length == 0)
                                                        {
                                                            if(parseInt(str) != NaN && str.length > 0)
                                                            {
                                                                if(isNaN(str) == true || str.length > 7)
                                                                {
                                                                    str = '';
                                                                }
                                                                else{
                                                                    console.log(parseInt(str));
                                                                    io.sockets.emit('message', str.toString());
                                                                    str = '';
                                                                }
                                                            }
                                                        }
                                                        else
                                                            str = str+""+data;
                                                        */
                                                        //-----------------------------------------------



                                                        var data = data.toString('utf8');
							data = data.replace(" ","");
                                                        data = data.replace(".","");
							//console.log(parseInt(data));
							//data = parseInt(data);
							
							if(data == NaN)
								return;
							
							//if(data < 10)
							//	data = "00"+""+data.toString();
							//console.log(parseInt(data));
							io.sockets.emit('message', data.toString());



















                                                        
                                                        /*var data = data.toString('utf8');
							data = data.replace(" ","");
							//console.log(parseInt(data));
							//data = parseInt(data);
							//data = parseFloat(data)/100;
                                                        //data = parseInt(data);

							if(data == NaN)
								return;
							
							if(data < 10)
                                                            data = "00"+""+data.toString();
                                                        console.log(parseInt(data));
							io.sockets.emit('message', data.toString());*/
                                                         
						});
					});
					initPrinter();
				});
			}
			else{
				initPrinter();
			}
		}
		catch (err) {
			console.log("No Weight Attached");
			initPrinter();
		}
	}


                                                   
	
	var printer = undefined;
	function initPrinter() {
                //console.log("Connecting Printer");
		if(printer == undefined)
		{
			try{
				if (fs.existsSync('/dev/usb/lp0')) {
					var result = exec("echo RaspberryPi | sudo -S chmod a+rw /dev/usb/lp0", function (error, stdout, stderr) {
                                                console.log("Printer Ok");
						console.log(error);
						try{
							printer = new SerialPort('/dev/usb/lp0', { baudrate: 9600});
                                                        console.log("Open Printer Port");
                                                        //console.log(printer);
						}
						catch(e){
                                                    //console.log("Printer Not Ok",e);
                                                }
						return printer;
					});
				}
				else{
					setTimeout(function(){
						initPrinter();
					},1000);
				}
			}
			catch(err){
				setTimeout(function(){
					initPrinter();
				},1000);
				console.log("Error on printer"+err);
			}
		}
		else{
			return printer;
		}
	}

	///////// GENERAL_SETTINGS_END //////////////////////////
	app.use(function(req, res, next) {
		log(req);
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	pingpong();
	function pingpong() {
		setTimeout(function () {
			var sql = "SELECT * from ping_pong";
			con.query(sql, function (err, result) {
			});
			setTimeout(function () {
				pingpong();
			},1000);
		},300000);
	}

	function getMonth() {
		var date = new Date();
		var MM = date.getMonth()+1;
		MM =  parseInt(MM)<10 ? '0'+MM : MM;
		return MM;
	}

	function getYear() {
		var date = new Date();
		var yy = date.getFullYear();
		return yy;
	}

	function database_datetime() {
		var date = new Date();
		var dd = date.getDate();
		dd =  parseInt(dd)<10 ? '0'+dd : dd;
		var MM = date.getMonth()+1;
		MM =  parseInt(MM)<10 ? '0'+MM : MM;
		var yy = date.getFullYear();
		var hh = date.getHours();
		hh =  parseInt(hh)<10 ? '0'+hh : hh;
		var mm = date.getMinutes();
		mm =  parseInt(mm)<10 ? '0'+mm : mm;
		var ss = date.getSeconds();
		ss =  parseInt(ss)<10 ? '0'+ss : ss;
		var sDate = '';
		sDate = yy+'-'+MM+'-'+dd+' '+hh+':'+mm+':'+ss;
		return sDate;
	}

	function debugConsole(str) {
		console.log(str);
	}


	io.sockets.on('connection', function (socket) {

		socket.on('label_print',function (data) {
			//var printData = data.data;
			//console.log(printData);
			//Print(printData);
		})


	});

	function Print(item) {

		console.log("^XA");
		console.log("^FX");
		console.log("^CF0,50");
		console.log("^FO50,30^GFA,1352,1352,13,,R06,Q01F8,Q07FE,P01IF8,P07IFE,P0KF,O03KFC,O0MF,N03MFC,N0OF,M01OF8,M07OFE,L01QF8,L07QFE,K01SF8,K07SFE,K0UF,J03UFC,J0WF,I03WFC,I0YF,003YFC,007YFE,01gGF8,07gGFE,:007YFE,I07WFE,J0WF,J07UFE,:J03UFC,:J01UF8,:K0UF,:K07SFE,K03SFC,:K01SF8,:8K0SFK01,:CK07QFEK03,EK07QFEK07,EK03QFCK07,FK01QF8K0F,:F8K0QFK01F,FCK0QFK03F,FCK07OFEK03F,FEK07OFEK07F,FEK03OFCK07F,FFK03OFCK0FF,FF8J01OF8J01FF,FF8K0OFK01FF,FFCK0OFK03FF,FFCK07MFEK03FF,FFEK07MFEK07FF,IFK03MFCK0IF,:IF8J01MF8J01IF,:IFCK0MFK03IF,IFEK07KFEK07IF,:JFK03KFCK0JF,JF8J03KFCJ01JF,JF8J01KF8J01JF,JFCJ01KF8J03JF,JFCK0KFK03JF,JFEK0KFK07JF,KFK07IFEK0KF,:KF8J03IFCJ01KF,KF8J01IF8J01KF,KFCJ01IF8J03KF,KFEK0IFK07KF,:LFK07FEK0LF,:7KF8J03FCJ01KFE,1KFCJ03FCJ03KF8,0KFCJ01F8J03KF,03JFEK0FK07JFC,00JFEK0FK07JF,003JFK06K0JFC,I0JF8J06J01JF,I03IF8O01IFC,I01IFCO03IF8,J07FFCO03FFE,J01FFEO07FF8,K07FFO0FFE,K01FFO0FF8,L07F8M01FE,L03F8M01FC,M0FCM03F,M03EM07C,N0EM07,N03M0C,,:^FS");
		console.log("^FO170,30^FDVIRTUE PLAST PVT. LTD.^FS");
		console.log("^CF0,22");
		console.log("^FO170,90^FDShed No. 17, Block no. 856/P, Kahaan Industrial Estate, Village:Santej,^FS");
		console.log("^CF0,22");
		console.log("^FO170,130^FDTaluka: Kalol, Dist.: Gandhinagar, Gujarat-382721.^FS");
		console.log("^FO50,170^GB750,1,3^FS");
		console.log("^FX ");
		console.log("^CF0,25");
		console.log("^FO50,195^FDPRODUCT :  "+item.Name+"^FS");
		console.log("^FO550,195^FDWEIGHT :  "+item.Weight+" Grams^FS");
		console.log("^FO50,240^GB750,1,3^FS");
		console.log("^FO50,260^FDPRODUCTION DATE      :  "+item.Date+"^FS");
		console.log("^FO50,310^FDGROSS WEIGHT^FS");
		console.log("^FO50,360^FDTARE WEIGHT^FS");
		console.log("^FO50,410^FDNET WEIGHT^FS");
		console.log("^FO50,470^FDT-"+scale_id+", SHIFT : "+item.Shift+" , OPERATOR CODE : "+item.Code+"  , QC APPROVED : ^FS");
		console.log("^FO290,310^FD:^FS");
		console.log("^FO290,360^FD:^FS");
		console.log("^FO290,410^FD:^FS");
		console.log("^FO290,470^FD:^FS");
		console.log("^FO310,310^FD"+item.Gross+"^FS");
		console.log("^FO310,360^FD "+item.Tare+"^FS");
		console.log("^FO310,410^FD"+item.Net+"^FS");
		console.log("^FO400,310^FDKgs.^FS");
		console.log("^FO400,360^FDKgs.^FS");
		console.log("^FO400,410^FDKgs.^FS");
		console.log("^FO50,450^GB750,1,3^FS");
		console.log("^FO50,510^GB7550,1,3^FS");
		console.log("^FX");
		console.log("^BY3,1,50");
		console.log("^FO200,520^BC^FD"+item.Barcode+"^FS");
		console.log("^XZ");

		//return;
		var printer_ = initPrinter();
		if(printer_ == undefined)
			return;
		//console.log(printer_);
		printer_.write("^XA", function(err) {
        });
		printer_.write("^FX", function(err) {
               
		});
		printer_.write("^CF0,50", function(err) {
                  
		});
		printer_.write("^FO50,30^GFA,1352,1352,13,,R06,Q01F8,Q07FE,P01IF8,P07IFE,P0KF,O03KFC,O0MF,N03MFC,N0OF,M01OF8,M07OFE,L01QF8,L07QFE,K01SF8,K07SFE,K0UF,J03UFC,J0WF,I03WFC,I0YF,003YFC,007YFE,01gGF8,07gGFE,:007YFE,I07WFE,J0WF,J07UFE,:J03UFC,:J01UF8,:K0UF,:K07SFE,K03SFC,:K01SF8,:8K0SFK01,:CK07QFEK03,EK07QFEK07,EK03QFCK07,FK01QF8K0F,:F8K0QFK01F,FCK0QFK03F,FCK07OFEK03F,FEK07OFEK07F,FEK03OFCK07F,FFK03OFCK0FF,FF8J01OF8J01FF,FF8K0OFK01FF,FFCK0OFK03FF,FFCK07MFEK03FF,FFEK07MFEK07FF,IFK03MFCK0IF,:IF8J01MF8J01IF,:IFCK0MFK03IF,IFEK07KFEK07IF,:JFK03KFCK0JF,JF8J03KFCJ01JF,JF8J01KF8J01JF,JFCJ01KF8J03JF,JFCK0KFK03JF,JFEK0KFK07JF,KFK07IFEK0KF,:KF8J03IFCJ01KF,KF8J01IF8J01KF,KFCJ01IF8J03KF,KFEK0IFK07KF,:LFK07FEK0LF,:7KF8J03FCJ01KFE,1KFCJ03FCJ03KF8,0KFCJ01F8J03KF,03JFEK0FK07JFC,00JFEK0FK07JF,003JFK06K0JFC,I0JF8J06J01JF,I03IF8O01IFC,I01IFCO03IF8,J07FFCO03FFE,J01FFEO07FF8,K07FFO0FFE,K01FFO0FF8,L07F8M01FE,L03F8M01FC,M0FCM03F,M03EM07C,N0EM07,N03M0C,,:^FS",function(err){
		});
		printer_.write("^FO170,30^FDVIRTUE PLAST PVT. LTD.^FS", function(err) {
		});
		printer_.write("^CF0,22", function(err) {
		});
		printer_.write("^FO170,90^FDShed No. 17, Block no. 856/P, Kahaan Industrial Estate, Village:Santej,^FS", function(err) {
		});
		printer_.write("^CF0,22", function(err) {
		});
		printer_.write("^FO170,130^FDTaluka: Kalol, Dist.: Gandhinagar, Gujarat-382721.^FS", function(err) {
		});
		printer_.write("^FO50,170^GB750,1,3^FS", function(err) {
		});
		printer_.write("^FX ", function(err) {
		});
		printer_.write("^CF0,25", function(err) {
		});
		printer_.write("^FO50,195^FDPRODUCT :  "+item.Name+"^FS", function(err) {
		});
		printer_.write("^FO550,195^FDWEIGHT :  "+item.Weight+" Grams^FS", function(err) {
		});
		printer_.write("^FO50,240^GB750,1,3^FS", function(err) {
		});
		printer_.write("^FO50,260^FDPRODUCTION DATE      :  "+item.Date+"^FS", function(err) {
		});
		printer_.write("^FO50,310^FDGROSS WEIGHT^FS", function(err) {
		});
		printer_.write("^FO50,360^FDTARE WEIGHT^FS", function(err) {
		});
		printer_.write("^FO50,410^FDNET WEIGHT^FS", function(err) {
		});
		printer_.write("^FO50,470^FDT-"+scale_id+", SHIFT : "+item.Shift+" , OPERATOR CODE : "+item.Code+"  , QC APPROVED : ^FS", function(err) {
		});
		printer_.write("^FO290,310^FD:^FS", function(err) {
		});
		printer_.write("^FO290,360^FD:^FS", function(err) {
		});
		printer_.write("^FO290,410^FD:^FS", function(err) {
		});
		printer_.write("^FO290,470^FD:^FS", function(err) {
		});
		printer_.write("^FO310,310^FD"+item.Gross+"^FS", function(err) {
		});
		printer_.write("^FO310,360^FD "+item.Tare+"^FS", function(err) {
		});
		printer_.write("^FO310,410^FD"+item.Net+"^FS", function(err) {
		});
		printer_.write("^FO400,310^FDKgs.^FS", function(err) {
		});
		printer_.write("^FO400,360^FDKgs.^FS", function(err) {
		});
		printer_.write("^FO400,410^FDKgs.^FS", function(err) {
		});
		printer_.write("^FO50,450^GB750,1,3^FS", function(err) {
		});
		printer_.write("^FO50,510^GB7550,1,3^FS", function(err) {
		});
		printer_.write("^FX", function(err) {
		});
		printer_.write("^BY3,1,50", function(err) {
		});
		printer_.write("^FO200,520^BC^FD"+item.Barcode+"^FS", function(err) {
		});
		printer_.write("^XZ", function(err) {
		});
	}

	io.sockets.on('disconnect', function (socket) {

	});


	function pad(num, size) {
		var s = num+"";
		while (s.length < size) s = "0" + s;
		return s;
	}

	var deleteRows = [];
	setTimeout(function(){
		var sql = "SELECT * FROM production_data WHERE Barcode IN (SELECT Barcode FROM production_data GROUP BY Barcode HAVING COUNT(Barcode) > 1) order by Barcode";
		debugConsole(sql);
		con.query(sql, function (err, result) {
			
			for(var j=0;j<result.length;j++)
			{
				if(result[j+1] != undefined)
				{
					if(result[j].Barcode == result[j+1].Barcode)
					//console.log(result[j].Id);
					deleteRows.push(result[j].Id);
				}
			}
			console.log(deleteRows);
			//if(deleteRows.length>0)
			//deleteSingle(deleteRows[0],0);
			
		});
	},1000);

	function deleteSingle(id,index)
	{
		var sql = "DELETE FROM production_data WHERE Id ="+id;
		debugConsole(sql);
		con.query(sql, function (err, result) {
			console.log(result);
			deleteRows.splice(0,1);
			setTimeout(function(){
				if(deleteRows.length>0)
				deleteSingle(deleteRows[0],0);
			},200);
			
		});
	}
	

	app.get('/api/getProductMaster',function (req,res) {

		var sql = "SELECT *,(SELECT Count(*) Count FROM production_data where production_data.ProductId = product_master.Id and Status = 1 and IsActive = 1) as Count from product_master where IsActive = 1 order by Weight asc";
		debugConsole(sql);
		con.query(sql, function (err, result) {
			if (err) {
				res.json({'error':true,'message':'Database Error'});
				return;
			}

			if(result.length > 0){
				res.json({'error':false,'data':result});
			}
			else{
				res.json({'error':false,'data':[]});
			}
		});
	});
	
	// --------------- Reset Packing-Count ------------------

	app.get('/api/getPackingCount',function (req,res) {
		var sql = "SELECT * from packing_count where Id = "+scale_id;
		debugConsole(sql);
		con.query(sql, function (err, result) {
			if (err) {
				res.json({'error':true,'message':'Database Error'});
				return;
			}

			if(result.length > 0){
				res.json({'error':false,'data':result});
			}
			else{
				res.json({'error':false,'data':[]});
			}
		});
	});

	app.get('/api/resetPackingCount',function (req,res) {
		var sql = "update packing_count set Count = 0 where Id = "+scale_id;
		debugConsole(sql);
		con.query(sql, function (err, result) {
			res.json({'error':false,'data':0});
		});
	});

	app.post('/api/login',function (req,res) {

		var username =  req.body.username;
		var password =  req.body.password;

		if(printer == undefined)
		{
			res.json({'error':true,'message':'Please Power on the Printer.'});
		}
		else{
			sql = "SELECT * FROM user_master where Username = '"+username+"' and Password = '"+password+"' and Role = 1 and IsActive = 1";
			debugConsole(sql);
			con.query(sql, function (err, result) {
				if(result)
				{
					if(result.length == 0)
					{
						res.json({'error':true,'message':'Invalid Username or Password !'});
					}
					else
					{
						var result_obj = result;
						sql = "update user_master set LastLogin = now() where Id = "+result[0].Id;
						debugConsole(sql);
						con.query(sql, function (err, result) {
							res.json({'error':false,'data':result_obj});
						});
					}
				}
				else{
					res.json({'error':true,'message':'Invalid Username or Password !'});
				}
			});
		}
	});

	// ------------------ Production Data ------------------------

	app.post('/api/insert_product_data',function (req,res) {

		var Gross = req.body.Gross;
		var Tare = req.body.Tare;
		var Net = req.body.Net;
		var ProductId= req.body.ProductId;
		var Name= req.body.Name;
		var Weight= req.body.Weight;
		var PackedById= req.body.PackedById;
		var PackedByName= req.body.PackedByName;
		var PackedByCode= req.body.PackedByCode;
		var Shift= req.body.Shift;
        
		var Extra1= req.body.Extra1;
		var Extra2= req.body.Extra2;
		var Remarks = req.body.Remarks;
		var PrintCopy = req.body.PrintCopy;

		var date = database_datetime();

		var sql = "INSERT INTO production_data (Status,Gross,Tare,Net,Scale_Id,ProductId,Name,Weight,PackedById,PackedByName,PackedByCode,Shift,Production_date," +
				"Extra1,Extra2,Remarks,Created,Updated,IsActive) VALUES " +
				"(1,"+Gross+","+Tare+","+Net+","+scale_id+","+ProductId+",'"+Name+"',"+Weight+","+PackedById+",'"+PackedByName+"','"+PackedByCode+"','"+Shift+"',now()," +
				"'"+Extra1+"','"+Extra2+"','"+Remarks+"',now(),now(),1);";
			debugConsole(sql);
			con.query(sql, function (err, result) {
			sql = "update packing_count set Count = (Count + 1) where Id = "+scale_id;
				con.query(sql, function (err, result) {
					sql = "SELECT * FROM production_data where Scale_Id = "+scale_id+" order by Id desc limit 1";
						con.query(sql, function (err, result) {
							console.log(result);
							var item = {"Name":Name,"Weight":Weight,"Date":date,"Shift":Shift,"Code":PackedByCode,"Gross":Gross,"Tare":Tare,"Net":Net,"Barcode":result[0].Barcode};
							var p = parseInt(PrintCopy);
							for(var i=0;i<p;i++)            
							Print(item);
							io.sockets.emit('printdone', "ok");
							res.json({'error':false,'message':'Print Success'});
						});
				});
		});
	});

	app.post('/api/test_product_data',function (req,res) {
		var Gross = req.body.Gross;
		var Tare = req.body.Tare;
		var Net = req.body.Net;
		var ProductId= req.body.ProductId;
		var Name= req.body.Name;
		var Weight= req.body.Weight;
		var PackedById= req.body.PackedById;
		var PackedByName= req.body.PackedByName;
		var PackedByCode= req.body.PackedByCode;
		var Shift= req.body.Shift;

		var Extra1= req.body.Extra1;
		var Extra2= req.body.Extra2;
		var Remarks = req.body.Remarks;
		var PrintCopy = req.body.PrintCopy;

		var date = database_datetime();
		var item = {"Name":Name,"Weight":Weight,"Date":date,"Shift":Shift,"Code":PackedByCode,"Gross":Gross,"Tare":Tare,"Net":Net,"Barcode":"0000000000"};
		var p = parseInt(PrintCopy);
		for(var i=0;i<p;i++)    
		Print(item);
		res.json({'error':false,'message':'Print Success'});
	});

	app.post('/api/duplicate_print',function (req,res) {

		var barcode = req.body.barcode;
		var PrintCopy = req.body.PrintCopy;
		var sql = "SELECT * from production_data where Barcode = '"+barcode+"' and IsActive = 1";
		debugConsole(sql);
		con.query(sql, function (err, result) {
			if (err) {
				res.json({'error':true,'message':'Database Error'});
				return;
			}
			if(result.length > 0){
				var item = {"Name":result[0].Name,"Weight":result[0].Weight,"Date":result[0].Created.toString().split('GMT')[0],"Shift":result[0].Shift,"Code":result[0].PackedByCode,"Gross":result[0].Gross,"Tare":result[0].Tare,"Net":result[0].Net,"Barcode":result[0].Barcode};
				var p = parseInt(PrintCopy);
				for(var i=0;i<p;i++)    
				Print(item);
				res.json({'error':false,'message':'Print Success'});
			}
			else{
				res.json({'error':true,'message':'Invalid Barcode Entered !'});
			}
		});
	});

	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});


};
