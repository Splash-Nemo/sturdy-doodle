extends Sprite2D


@export var speed = 400
@export var direction = 1


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	
	# move around
	global_position.x += speed * delta * direction
	
	# wrap around the world limits
	if global_position.x < -200 and direction == -1:
		global_position.x = 2000
	elif global_position.x > 2000 and direction == 1:
		global_position.x = -200
		
	# flip sprite
	if direction == 1:
		flip_h = true
	else:
		flip_h = false
	
