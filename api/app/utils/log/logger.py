import logging

FORMAT = '%(levelname)s %(asctime)s %(name)s %(message)s'
logging.basicConfig(filename=f'.log',
                    encoding='utf-8',
                    level=logging.DEBUG,
                    datefmt='%d-%m-%Y %H:%M:%S',
                    format=FORMAT)

log = logging.getLogger("main")